export const environment = {
  production: true,
  apiUrl: 'https://digital-gateway-b.onrender.com/api',
  allowedRoles: {
    admin: ['admin'],
    counselor: ['admin', 'counselor'],
    trainer: ['admin', 'trainer'],
    accountant: ['admin', 'accountant']
  }
};