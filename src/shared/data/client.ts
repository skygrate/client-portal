"use client";

import {
  configureDomainDataSource,
  configureApplicationsDataSource,
  configureInvoicesDataSource,
  configureSettingsDataSource,
} from "./index";
import {
  listByUser as listDomainByUser,
  createDomain,
  markDomainForDeletion,
  unmarkDomainForDeletion,
  deleteDomain,
} from "@domain/services/domains";
import {
  listAppsByUser,
  deleteApplication,
  markApplicationForDeletion,
  unmarkApplicationForDeletion,
  createApplication,
} from "@applications/services/apps";
import {
  listInvoicesByUser as amplifyListInvoices,
  getInvoiceUrl,
} from "@invoices/services/invoices";
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
} from "@settings/services/userProfile";

configureDomainDataSource({
  listByUser: listDomainByUser,
  create: createDomain,
  markForDeletion: markDomainForDeletion,
  cancelDeletion: unmarkDomainForDeletion,
  delete: deleteDomain,
});

configureApplicationsDataSource({
  listByUser: listAppsByUser,
  delete: deleteApplication,
  markForDeletion: markApplicationForDeletion,
  cancelDeletion: unmarkApplicationForDeletion,
  create: createApplication,
});

configureInvoicesDataSource({
  listByUser: amplifyListInvoices,
  getInvoiceUrl,
});

configureSettingsDataSource({
  getProfile: getUserProfile,
  createProfile: createUserProfile,
  updateProfile: updateUserProfile,
});
