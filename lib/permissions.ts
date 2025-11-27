export const PERMISSIONS = {
    // Only admins can manage workspace, roles, joins and members
    //   workspace: {
    //     manageWorkspace: "Manage workspace settings",
    //     manageRoles: "Manage roles and permissions",
    //     manageInvites: "Manage invites/join requests",
    //     manageMembers: "Manage workspace members",
    //     deleteWorkspace: "Delete workspace",
    //   },
    inventory: {
        viewProducts: "View products",
        createProduct: "Add products",
        editProduct: "Edit products",
        deleteProduct: "Delete products",
        stockIn: "Stock‑in products",
        stockOut: "Stock‑out products",
        importExportProducts: "Import/Export product data",
    },
    billing: {
        viewInvoices: "View invoices",
        generateInvoice: "Generate invoices",
        sendInvoiceEmail: "Send invoice emails",
        markPayment: "Mark payment received",
        editInvoice: "Edit invoices",
        deleteInvoice: "Delete invoices",
    },
    surgeons: {
        viewSurgeons: "View surgeons",
        manageSurgeons: "Manage surgeons",
    },
    analytics: {
        viewAnalytics: "View analytics",
        exportAnalytics: "Export analytics",
    },
    ai: {
        viewForecasts: "View forecasts",
        runForecasts: "Run forecasts",
        viewAnomalies: "View anomalies",
    },
    notifications: {
        viewNotifications: "View notifications",
        manageNotifications: "Configure notifications",
        sendManualEmails: "Send custom emails",
    },
    system: {
        viewActivityLog: "View activity log",
        manageAPIKeys: "Manage API keys",
        manageIntegrations: "Manage integrations",
    },
};

export const ALL_PERMISSION_KEYS = Object.values(PERMISSIONS).flatMap(Object.keys);

export const isValidPermission = (key: string) =>
    ALL_PERMISSION_KEYS.includes(key);