import { beforeEach, describe, expect, it, vi } from "vitest";

describe("data layer configuration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("domains helpers throw if unconfigured", async () => {
    const module = await import("../domains");
    await expect(module.listDomainsByUser("u1")).rejects.toThrow(/Domain data source not configured/);
  });

  it("domains helpers delegate to configured source", async () => {
    const module = await import("../domains");
    const listByUser = vi.fn().mockResolvedValue([{ userId: "u1", name: "example.com", s3_prefix: "p/" }]);
    const create = vi.fn();
    const mark = vi.fn();
    const cancel = vi.fn();
    const remove = vi.fn();

    module.configureDomainDataSource({
      listByUser,
      create,
      markForDeletion: mark,
      cancelDeletion: cancel,
      delete: remove,
    });

    expect(await module.listDomainsByUser("u1")).toHaveLength(1);
    await module.createDomainRecord("u1", "example.com");
    await module.markDomainForDeletion("u1", "example.com");
    await module.cancelDomainDeletion("u1", "example.com");
    await module.deleteDomainRecord("u1", "example.com");

    expect(listByUser).toHaveBeenCalledWith("u1");
    expect(create).toHaveBeenCalledWith("u1", "example.com");
    expect(mark).toHaveBeenCalledWith("u1", "example.com");
    expect(cancel).toHaveBeenCalledWith("u1", "example.com");
    expect(remove).toHaveBeenCalledWith("u1", "example.com");
  });

  it("applications helpers delegate once configured", async () => {
    const module = await import("../applications");
    const list = vi.fn().mockResolvedValue([]);
    const del = vi.fn();
    const mark = vi.fn();
    const cancel = vi.fn();
    const create = vi.fn();

    module.configureApplicationsDataSource({
      listByUser: list,
      delete: del,
      markForDeletion: mark,
      cancelDeletion: cancel,
      create,
    });

    await module.listApplicationsByUser("user");
    await module.deleteApplicationRecord({ userId: "user", domain: "d", appName: "app" });
    await module.markApplicationForDeletion({ userId: "user", domain: "d", appName: "app" });
    await module.cancelApplicationDeletion({ userId: "user", domain: "d", appName: "app" });
    await module.createApplicationRecord({ userId: "user", domain: "d", appName: "app", type: "STATIC" });

    expect(list).toHaveBeenCalledWith("user");
    expect(del).toHaveBeenCalledWith({ userId: "user", domain: "d", appName: "app" });
    expect(mark).toHaveBeenCalledWith({ userId: "user", domain: "d", appName: "app" });
    expect(cancel).toHaveBeenCalledWith({ userId: "user", domain: "d", appName: "app" });
    expect(create).toHaveBeenCalledWith({ userId: "user", domain: "d", appName: "app", type: "STATIC" });
  });

  it("invoices helpers delegate once configured", async () => {
    const module = await import("../invoices");
    const list = vi.fn().mockResolvedValue([]);
    const getUrl = vi.fn().mockResolvedValue("https://example.com");

    module.configureInvoicesDataSource({
      listByUser: list,
      getInvoiceUrl: getUrl,
    });

    await module.listInvoicesByUser("user");
    await module.getInvoiceDownloadUrl("user", "invoice.pdf");

    expect(list).toHaveBeenCalledWith("user");
    expect(getUrl).toHaveBeenCalledWith("user", "invoice.pdf");
  });

  it("settings helpers delegate once configured", async () => {
    const module = await import("../settings");
    const getProfile = vi.fn().mockResolvedValue(null);
    const createProfile = vi.fn();
    const updateProfile = vi.fn();

    module.configureSettingsDataSource({
      getProfile,
      createProfile,
      updateProfile,
    });

    await module.getUserProfileRecord("user");
    await module.createUserProfileRecord({ userId: "user" });
    await module.updateUserProfileRecord({ userId: "user" });

    expect(getProfile).toHaveBeenCalledWith("user");
    expect(createProfile).toHaveBeenCalledWith({ userId: "user" });
    expect(updateProfile).toHaveBeenCalledWith({ userId: "user" });
  });
});
