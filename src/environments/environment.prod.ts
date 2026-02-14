export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api',
  allowedRoles: {
    admin: ['admin'],
    counselor: ['admin', 'counselor'],
    trainer: ['admin', 'trainer'],
    accountant: ['admin', 'accountant']
  }
};