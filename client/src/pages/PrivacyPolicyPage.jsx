import React from 'react';
import {
  FaShieldAlt, FaUserLock, FaServer, FaCookieBite,
  FaEnvelope, FaMapMarkerAlt, FaGlobe, FaFileContract, FaShareAlt
} from 'react-icons/fa';
import Meta from '../components/common/Meta';

const PrivacyPolicyPage = () => {
  const tathagatLink = "https://tathagatglobal.com/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnrLXkpnvvrrlYGcTXiRRuT8-RYsnvsiDf_QBsdesheI8grG7Vnfb3WJ6-Q-k&brid=rbcvnujHlW9WwRhN4QE3AA";

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Meta title="Privacy Policy | Nyoranix" description="Read the privacy policy regarding data collection, usage, and protection." />

      {/* === 1. HERO HEADER === */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm shadow-lg">
            <FaShieldAlt className="text-blue-300 text-2xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Nyoranix values User trust. This document outlines how Nyoranix collects, protects, and uses personal data.
          </p>
          <p className="mt-6 text-sm font-medium text-blue-200 uppercase tracking-widest border-t border-blue-800/50 inline-block pt-4">
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
              This Privacy Policy (“Policy”) describes how <span className="font-bold text-gray-900">Nyoranix</span> manages information provided by users while using <span className="text-blue-600 font-medium">www.nyoranix.com</span>. Nyoranix is powered by <a href={tathagatLink} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 hover:underline">Tathagat Tech Universe</a>, an MSME-registered entity.
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-12">

            {/* Section 1: Scope */}
            <Section title="1. Scope of This Policy" icon={<FaGlobe className="text-blue-500" />}>
              <p className="mb-4 text-gray-600">This Policy applies to:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ListItem>Visitors browsing the Website</ListItem>
                <ListItem>Registered users and customers</ListItem>
                <ListItem>Individual and institutional (B2B) buyers</ListItem>
              </ul>
              <p className="mt-3 text-sm text-gray-400 italic">This Policy does not apply to information collected offline.</p>
            </Section>

            {/* Section 2: Collection */}
            <Section title="2. Data Collection" icon={<FaFileContract className="text-green-500" />}>
              <div className="bg-blue-50 p-6 rounded-2xl mb-6 border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">2.1 Personal Information</h4>
                <p className="text-sm text-gray-600 mb-2">Nyoranix may collect the following personal information when a User registers or places an order:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                  <ListItem>Full Name</ListItem>
                  <ListItem>Email Address</ListItem>
                  <ListItem>Mobile Number</ListItem>
                  <ListItem>Billing & Shipping Address</ListItem>
                  <ListItem>GSTIN (for Business)</ListItem>
                </ul>
              </div>

              <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">2.2 Excluded Data Storage (SPDI)</h4>
                <p className="text-sm text-gray-600 mb-3">Nyoranix never stores sensitive financial data like:</p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-white border border-red-200 rounded-full text-xs font-bold text-red-600">Credit Card Numbers</span>
                  <span className="px-3 py-1 bg-white border border-red-200 rounded-full text-xs font-bold text-red-600">UPI PINs</span>
                  <span className="px-3 py-1 bg-white border border-red-200 rounded-full text-xs font-bold text-red-600">Net Banking Passwords</span>
                </div>
              </div>
            </Section>

            {/* Section 3: Usage */}
            <Section title="3. Data Usage" icon={<FaUserLock className="text-purple-500" />}>
              <ul className="space-y-3 text-gray-600">
                <ListItem>Processing orders, shipping, and generating GST invoices.</ListItem>
                <ListItem>Sending order updates and tracking information.</ListItem>
                <ListItem>Improving website performance and user experience.</ListItem>
                <ListItem>Compliance with legal and regulatory obligations.</ListItem>
              </ul>
            </Section>

            {/* Section 4 & 5: Cookies & Sharing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FaCookieBite className="text-orange-500" /> 4. Cookies
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Cookies are used to maintain user sessions and analyze traffic. Users can disable them in browser settings, though some site features may be affected.
                  </p>
               </div>
               <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FaShareAlt className="text-teal-500" /> 5. Data Sharing
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Nyoranix <strong>never sells</strong> User data. Data is shared only with logistics partners (for delivery) and payment gateways (for transaction processing).
                  </p>
               </div>
            </div>

            {/* Section 6: Security */}
            <Section title="6. Security Practices" icon={<FaServer className="text-indigo-500" />}>
              <p className="text-gray-600 mb-4">
                Nyoranix implements industry-standard security measures compliant with Indian laws.
              </p>
              <div className="flex flex-wrap gap-3">
                 <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-100 text-sm font-bold">
                    <FaShieldAlt /> Secure Servers
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-100 text-sm font-bold">
                    <FaShieldAlt /> Encrypted Payments
                 </div>
              </div>
            </Section>

             {/* Section 7-11: Short Details */}
            <div className="space-y-6">
                <Section title="7. Data Retention & Rights" icon={<FaFileContract className="text-gray-400" />}>
                    <p className="text-gray-600 text-sm mb-2">Data is retained only as long as necessary for legal and business purposes. Users have the right to request corrections or deletion of data.</p>
                </Section>
                <Section title="8. Third-Party Links" icon={<FaGlobe className="text-gray-400" />}>
                     <p className="text-gray-600 text-sm">Nyoranix is not responsible for the privacy practices of external websites linked from here.</p>
                </Section>
            </div>


            {/* === CONTACT HIGHLIGHT SECTION === */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
               <div className="relative z-10">
                 <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                   <FaEnvelope /> 12. Grievance & Contact
                 </h2>
                 <p className="mb-6 opacity-90 text-blue-50">
                   Questions about data? Contact the Grievance Officer powered by <a href={tathagatLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Tathagat Tech Universe</a>.
                 </p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                   <div className="bg-white/10 p-5 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                     <p className="text-blue-200 text-xs uppercase font-bold mb-1">Email Support</p>
                     <a href="mailto:nyoranix@gmail.com" className="text-white font-bold hover:underline text-lg tracking-wide">nyoranix@gmail.com</a>
                   </div>
                   <div className="bg-white/10 p-5 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                     <p className="text-blue-200 text-xs uppercase font-bold mb-1">Address</p>
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
                 Disclaimer: This Privacy Policy is intended to comply with Indian laws. Users are advised to review this Policy periodically.
               </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// === Helper Components for Consistency ===

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
    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
    <span className="text-gray-700">{children}</span>
  </li>
);

export default PrivacyPolicyPage;