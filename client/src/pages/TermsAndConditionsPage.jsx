import React from 'react';
import {
  FaGavel, FaCheckCircle, FaStore, FaUserShield, FaExclamationTriangle,
  FaRupeeSign, FaShippingFast, FaUndo, FaBan, FaCopyright, FaEnvelope, FaMapMarkerAlt
} from 'react-icons/fa';
import Meta from '../components/common/Meta';

const TermsAndConditionsPage = () => {
  const tathagatLink = "https://tathagatglobal.com/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnrLXkpnvvrrlYGcTXiRRuT8-RYsnvsiDf_QBsdesheI8grG7Vnfb3WJ6-Q-k&brid=rbcvnujHlW9WwRhN4QE3AA";

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Meta title="Terms & Conditions | Nyoranix" description="Read the Terms and Conditions for using Nyoranix website and services." />

      {/* === 1. HERO HEADER === */}
      <div className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm shadow-lg">
            <FaGavel className="text-purple-300 text-2xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Terms & Conditions</h1>
          <p className="text-purple-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully before using the services. They govern the relationship with Nyoranix.
          </p>
          <p className="mt-6 text-sm font-medium text-purple-200 uppercase tracking-widest border-t border-purple-800/50 inline-block pt-4">
            Last Updated: January 2026
          </p>
        </div>
      </div>

      {/* === 2. FLOATING CONTENT CARD === */}
      <div className="container mx-auto px-4 -mt-20 pb-20 relative z-20">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

          {/* Introduction */}
          <div className="p-8 md:p-12 border-b border-gray-100 bg-gray-50/30">
            <p className="text-gray-700 leading-loose text-lg">
              These Terms and Conditions (“Terms”) govern the access and use of the website <span className="text-purple-600 font-medium">www.nyoranix.com</span> operated under the brand name <span className="font-bold text-gray-900">Nyoranix</span>, powered by <a href={tathagatLink} target="_blank" rel="noopener noreferrer" className="font-bold text-purple-700 hover:underline">Tathagat Tech Universe</a>.
            </p>
            <p className="text-gray-600 mt-4 text-sm">
              By accessing, browsing, or purchasing from this Website, the User agrees to be bound by these Terms. If there is disagreement, please do not use the Website.
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-12">

            {/* Section 1: Eligibility */}
            <Section title="1. Eligibility" icon={<FaCheckCircle className="text-green-500" />}>
              <p className="mb-4 text-gray-600">By using this Website, the User confirms that:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ListItem>User is at least 18 years of age.</ListItem>
                <ListItem>User is legally competent to enter into a binding contract under Indian law.</ListItem>
              </ul>
            </Section>

            {/* Section 2: Nature of Business */}
            <Section title="2. Nature of Business" icon={<FaStore className="text-blue-500" />}>
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <p className="text-gray-700 mb-3">
                  Nyoranix is engaged in the <span className="font-bold">sale, supply, and manufacture</span> of electronic components, modules, and technology products through an online platform.
                </p>
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                  <FaExclamationTriangle />
                  <span>Nyoranix does not provide development, consulting, or engineering services through this Website.</span>
                </div>
              </div>
            </Section>

            {/* Section 3: Account */}
            <Section title="3. Account Registration" icon={<FaUserShield className="text-indigo-500" />}>
              <ul className="space-y-3 text-gray-600">
                <ListItem>Users may be required to create an account to place orders.</ListItem>
                <ListItem>The User is responsible for maintaining the confidentiality of login credentials.</ListItem>
                <ListItem>Nyoranix reserves the right to suspend accounts found to be fraudulent.</ListItem>
              </ul>
            </Section>

            {/* Section 4: Product Info */}
            <Section title="4. Product Information" icon={<FaExclamationTriangle className="text-orange-500" />}>
              <ul className="space-y-3 text-gray-600">
                <ListItem>Product images are for illustrative purposes only; actual products may vary slightly.</ListItem>
                <ListItem>Specifications are provided to the best of Nyoranix's knowledge; verify suitability before purchase.</ListItem>
                <ListItem>All products are subject to availability and may be discontinued without notice.</ListItem>
              </ul>
            </Section>

            {/* Section 5: Pricing */}
            <Section title="5. Pricing & Payment" icon={<FaRupeeSign className="text-teal-600" />}>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700">
                   <strong>Prices:</strong> Listed in Indian Rupees (INR).
                 </div>
                 <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700">
                   <strong>Taxes:</strong> GST charged as per Indian law.
                 </div>
                 <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 sm:col-span-2">
                   <strong>Security:</strong> Payments processed via secure gateways. Nyoranix does not store card details.
                 </div>
               </div>
            </Section>

            {/* Section 6: Order Acceptance */}
            <Section title="6. Order Cancellation" icon={<FaBan className="text-red-500" />}>
              <p className="text-gray-600 mb-3">Nyoranix reserves the right to cancel orders due to:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                <ListItem>Pricing errors</ListItem>
                <ListItem>Stock unavailability</ListItem>
                <ListItem>Suspected fraud</ListItem>
                <ListItem>Regulatory compliance issues</ListItem>
              </ul>
            </Section>

            {/* Section 7 & 8: Shipping & Returns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FaShippingFast className="text-blue-600" /> 7. Shipping
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Delivery timelines are estimates. Risk of loss transfers to the customer upon delivery. Nyoranix is not liable for courier delays or force majeure events.
                  </p>
               </div>
               <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FaUndo className="text-purple-600" /> 8. Returns
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    All returns, refunds, and cancellations are governed by the separate Refund Policy available on the website.
                  </p>
               </div>
            </div>

            {/* Section 9: Use of Website */}
            <Section title="9. Use of Website" icon={<FaBan className="text-red-600" />}>
               <p className="text-gray-600 mb-3">Users agree <strong>NOT</strong> to:</p>
               <ul className="space-y-2 text-sm text-gray-600">
                 <li className="flex gap-2 items-center"><span className="w-2 h-2 bg-red-400 rounded-full"></span> Misuse the Website or attempt unauthorized access.</li>
                 <li className="flex gap-2 items-center"><span className="w-2 h-2 bg-red-400 rounded-full"></span> Upload malicious code.</li>
                 <li className="flex gap-2 items-center"><span className="w-2 h-2 bg-red-400 rounded-full"></span> Violate any applicable laws.</li>
               </ul>
            </Section>

            {/* Section 10: IP */}
            <Section title="10. Intellectual Property" icon={<FaCopyright className="text-gray-800" />}>
               <p className="text-gray-600 text-sm">
                 All content on this Website (text, images, logos, designs) is the property of Nyoranix. Unauthorized use, reproduction, or distribution is strictly prohibited.
               </p>
            </Section>

            {/* === CONTACT HIGHLIGHT SECTION === */}
            <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
               <div className="relative z-10">
                 <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                   <FaEnvelope /> Contact Information
                 </h2>
                 <p className="mb-6 opacity-90 text-purple-100">
                   For any queries regarding these Terms, please contact Nyoranix.
                 </p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                   <div className="bg-white/10 p-5 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                     <p className="text-purple-200 text-xs uppercase font-bold mb-1">Email Support</p>
                     <a href="mailto:support@nyoranix.com" className="text-white font-bold hover:underline text-lg tracking-wide">support@nyoranix.com</a>
                     <br/>
                     <a href="mailto:nyoranix@gmail.com" className="text-gray-300 text-xs hover:text-white">nyoranix@gmail.com</a>
                   </div>
                   <div className="bg-white/10 p-5 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                     <p className="text-purple-200 text-xs uppercase font-bold mb-1">Headquarters</p>
                     <p className="font-medium flex items-start gap-2 leading-snug">
                       <FaMapMarkerAlt className="mt-1 flex-shrink-0" />
                       Ashirwad Building, Vadgaon Bk,<br/> Pune, Maharashtra 411041
                     </p>
                   </div>
                 </div>
               </div>

               {/* Decorative Background Element */}
               <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Disclaimer */}
            <div className="text-center pt-8 border-t border-gray-100">
               <p className="text-xs text-gray-400">
                 Disclaimer: These Terms are governed by Indian laws. Nyoranix reserves the right to modify these terms at any time.
               </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// === Helper Components ===

const Section = ({ title, icon, children }) => (
  <section className="animate-fade-in">
    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
      <span className="p-2 bg-gray-100 rounded-lg">{icon}</span>
      {title}
    </h2>
    <div className="pl-2 md:pl-14">
      {children}
    </div>
  </section>
);

const ListItem = ({ children }) => (
  <li className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition-colors">
    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
    <span className="text-gray-700">{children}</span>
  </li>
);

export default TermsAndConditionsPage;