import { beforeEach, describe, expect, it, vi } from "vitest";

describe("data layer configuration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("domains helpers throw if unconfigured", async () => {
    const domainModule = await import("../domains");
    await expect(domainModule.listDomainsByUser("u1")).rejects.toThrow(/Domain data source not configured/);
  });

  it("domains helpers delegate to configured source", async () => {
    const domainModule = await import("../domains");
    const listByUser = vi.fn().mockResolvedValue([{ userId: "u1", name: "example.com", s3_prefix: "p/" }]);
    const create = vi.fn();
    const mark = vi.fn();
    const cancel = vi.fn();
    const remove = vi.fn();

    domainModule.configureDomainDataSource({
      listByUser,
      create,
      markForDeletion: mark,
      cancelDeletion: cancel,
      delete: remove,
    });

    expect(await domainModule.listDomainsByUser("u1")).toHaveLength(1);
    await domainModule.createDomainRecord("u1", "example.com");
    await domainModule.markDomainForDeletion("u1", "example.com");
    await domainModule.cancelDomainDeletion("u1", "example.com");
    await domainModule.deleteDomainRecord("u1", "example.com");

    expect(listByUser).toHaveBeenCalledWith("u1");
    expect(create).toHaveBeenCalledWith("u1", "example.com");
    expect(mark).toHaveBeenCalledWith("u1", "example.com");
    expect(cancel).toHaveBeenCalledWith("u1", "example.com");
    expect(remove).toHaveBeenCalledWith("u1", "example.com");
  });

  it("applications helpers delegate once configured", async () => {
    const applicationsModule = await import("../applications");
    const list = vi.fn().mockResolvedValue([]);
    const del = vi.fn();
    const mark = vi.fn();
    const cancel = vi.fn();
    const create = vi.fn();

    applicationsModule.configureApplicationsDataSource({
      listByUser: list,
      delete: del,
      markForDeletion: mark,
      cancelDeletion: cancel,
      create,
    });

    await applicationsModule.listApplicationsByUser("user");
    await applicationsModule.deleteApplicationRecord({ userId: "user", domain: "d", appName: "app" });
    await applicationsModule.markApplicationForDeletion({ userId: "user", domain: "d", appName: "app" });
    await applicationsModule.cancelApplicationDeletion({ userId: "user", domain: "d", appName: "app" });
    await applicationsModule.createApplicationRecord({ userId: "user", domain: "d", appName: "app", type: "STATIC" });

    expect(list).toHaveBeenCalledWith("user");
    expect(del).toHaveBeenCalledWith({ userId: "user", domain: "d", appName: "app" });
    expect(mark).toHaveBeenCalledWith({ userId: "user", domain: "d", appName: "app" });
    expect(cancel).toHaveBeenCalledWith({ userId: "user", domain: "d", appName: "app" });
    expect(create).toHaveBeenCalledWith({ userId: "user", domain: "d", appName: "app", type: "STATIC" });
  });

  it("invoices helpers delegate once configured", async () => {
    const invoicesModule = await import("../invoices");
    const list = vi.fn().mockResolvedValue([]);
    const getUrl = vi.fn().mockResolvedValue("https://example.com");

    invoicesModule.configureInvoicesDataSource({
      listByUser: list,
      getInvoiceUrl: getUrl,
    });

    await invoicesModule.listInvoicesByUser("user");
    await invoicesModule.getInvoiceDownloadUrl("user", "invoice.pdf");

    expect(list).toHaveBeenCalledWith("user");
    expect(getUrl).toHaveBeenCalledWith("user", "invoice.pdf");
  });

  it("settings helpers delegate once configured", async () => {
    const settingsModule = await import("../settings");
    const getProfile = vi.fn().mockResolvedValue(null);
    const createProfile = vi.fn();
    const updateProfile = vi.fn();

    settingsModule.configureSettingsDataSource({
      getProfile,
      createProfile,
      updateProfile,
    });

    await settingsModule.getUserProfileRecord("user");
    await settingsModule.createUserProfileRecord({ userId: "user" });
    await settingsModule.updateUserProfileRecord({ userId: "user" });

    expect(getProfile).toHaveBeenCalledWith("user");
    expect(createProfile).toHaveBeenCalledWith({ userId: "user" });
    expect(updateProfile).toHaveBeenCalledWith({ userId: "user" });
  });
});
