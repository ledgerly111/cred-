export const WHATSAPP_NUMBER = '94770597811';
export const DISPLAY_PHONE = '+94 77 059 7811';
export const CONTACT_DESCRIPTION = 'Whether you are considering your first degree, returning to education, exploring a professional qualification or planning a career change, we are ready to listen and guide you.';
export const FOOTER_DESCRIPTION = 'CRED goes beyond admissions to shape educational journeys. It is a career-focused learning advisory that helps students and working professionals build the right combination of academic qualifications, professional certifications and practical skills.';
export function whatsappLink(message = 'Hello CRED! I would like to book a free consultation. Please help me explore programmes, scholarships and a learning pathway that fits my career goals.') {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
// Figures explicitly supplied and requested for display by the client.
export const impactFigures = [
  ['350+', 'Learners counselled'],
  ['125+', 'Successful enrolments'],
  ['50+', 'Academic and professional pathways'],
  ['12+', 'Nationalities supported'],
  ['60%', 'Enquiries received through referrals or returning learners'],
];
