export const environment = {
  production: false,
  apiUrl: 'https://digital-gateway-b.onrender.com/api',
  allowedRoles: {
    admin: ['admin'],
    counselor: ['admin', 'counselor'],
    trainer: ['admin', 'trainer'],
    accountant: ['admin', 'accountant']
  }
};