import React from 'react';
import {
  FaUndo, FaBan, FaBoxOpen, FaMoneyBillWave, FaExchangeAlt,
  FaWrench, FaExclamationCircle, FaEnvelope, FaMapMarkerAlt, FaShippingFast
} from 'react-icons/fa';
import Meta from '../components/common/Meta';

const RefundPolicyPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Meta title="Refund & Return Policy | Nyoranix" description="Read the policies regarding refunds, returns, and order cancellations." />

      {/* === 1. HERO HEADER === */}
      <div className="bg-gradient-to-r from-gray-900 via-teal-900 to-gray-900 text-white pt-20 pb-32 px-4 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm shadow-lg">
            <FaUndo className="text-teal-300 text-2xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Refund & Return Policy</h1>
          <p className="text-teal-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Nyoranix aims for transparency. Here is everything regarding cancellations, returns, and refunds.
          </p>
          <p className="mt-6 text-sm font-medium text-teal-200 uppercase tracking-widest border-t border-teal-800/50 inline-block pt-4">
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
              This Refund, Return, and Cancellation Policy (“Policy”) applies to all purchases made on <span className="text-teal-600 font-medium">www.nyoranix.com</span>. Due to the sensitive nature of electronic components, returns are governed by strict verification standards.
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-12">

            {/* Section 1: Cancellation */}
            <Section title="1. Order Cancellation" icon={<FaBan className="text-red-500" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                  <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">Before Dispatch</h4>
                  <p className="text-sm text-gray-600 mb-2">Orders may be cancelled by contacting support.</p>
                  <span className="text-xs font-bold text-white bg-green-600 px-2 py-1 rounded">Full Refund Processed</span>
                </div>
                <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                  <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">After Dispatch</h4>
                  <p className="text-sm text-gray-600 mb-2">Once the order has left the warehouse, it cannot be cancelled.</p>
                  <span className="text-xs font-bold text-white bg-red-600 px-2 py-1 rounded">Cancellation Not Allowed</span>
                </div>
              </div>
            </Section>

            {/* Section 2: Return Policy */}
            <Section title="2. Return Policy" icon={<FaBoxOpen className="text-blue-500" />}>
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3">✅ Returns Accepted If:</h4>
                <ul className="space-y-2">
                  <ListItem color="green">Product is damaged, defective, or incorrect.</ListItem>
                  <ListItem color="green">Issue reported within <strong className="text-gray-900">48 hours</strong> of delivery.</ListItem>
                  <ListItem color="green">Product is unused, uninstalled, and in original packaging.</ListItem>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-3">❌ Returns NOT Accepted For:</h4>
                <ul className="space-y-2">
                  <ListItem color="red">Used, soldered, programmed, or altered components.</ListItem>
                  <ListItem color="red">Burnt/damaged products due to misuse or overvoltage.</ListItem>
                  <ListItem color="red">Bulk/B2B or customized orders (unless DOA).</ListItem>
                </ul>
              </div>
            </Section>

            {/* Section 3 & 4: Process & Refunds */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FaShippingFast className="text-purple-600" /> 3. Return Process
                  </h3>
                  <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
                    <li>Email <span className="font-bold">support@nyoranix.com</span> with Order ID.</li>
                    <li>Share clear images/videos of the issue.</li>
                    <li>Wait for inspection approval.</li>
                    <li>Ship the item back only after approval.</li>
                  </ol>
               </div>
               <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-600" /> 4. Refunds
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li>Initiated after physical inspection.</li>
                    <li>Processed to original payment method.</li>
                    <li><strong>Timeline:</strong> 7–10 business days.</li>
                    <li>Shipping charges are generally non-refundable.</li>
                  </ul>
               </div>
            </div>

            {/* Section 5 & 6: Replacement & Warranty */}
            <Section title="5. Replacement & Warranty" icon={<FaWrench className="text-orange-500" />}>
               <p className="text-gray-600 mb-3">
                 <strong className="text-gray-900">Replacement:</strong> Subject to stock availability. Offered after verification.
               </p>
               <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-sm text-gray-700">
                 <strong className="block text-orange-800 mb-1">Manufacturing Warranty:</strong>
                 Some Nyoranix products carry a limited warranty. Details are on the product page.
                 <br/><span className="text-xs text-gray-500 mt-1 block">Note: Warranty does not cover misuse, wrong wiring, or modifications.</span>
               </div>
            </Section>

            {/* Section 7 & 8: Non-Returnable & Liability */}
            <Section title="Non-Returnable & Liability" icon={<FaExclamationCircle className="text-gray-600" />}>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                   <h4 className="font-bold text-sm text-gray-900 mb-2">Non-Returnable Items:</h4>
                   <ul className="text-sm text-gray-600 list-disc pl-4 space-y-1">
                     <li>Clearance/Discounted items</li>
                     <li>Software & Licenses</li>
                     <li>Custom-made products</li>
                   </ul>
                 </div>
                 <div>
                   <h4 className="font-bold text-sm text-gray-900 mb-2">Limitation of Liability:</h4>
                   <p className="text-sm text-gray-600">
                     Nyoranix’s liability is strictly limited to the <span className="font-bold">invoice value</span> of the product purchased.
                   </p>
                 </div>
               </div>
            </Section>

            {/* === CONTACT HIGHLIGHT SECTION === */}
            <div className="bg-gradient-to-br from-teal-800 to-gray-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
               <div className="relative z-10">
                 <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                   <FaEnvelope /> Support Contact
                 </h2>
                 <p className="mb-6 opacity-90 text-teal-100">
                   Need to return an item? Contact Nyoranix immediately.
                 </p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                   <div className="bg-white/10 p-5 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                     <p className="text-teal-200 text-xs uppercase font-bold mb-1">Email Support</p>
                     <a href="mailto:support@nyoranix.com" className="text-white font-bold hover:underline text-lg tracking-wide">support@nyoranix.com</a>
                   </div>
                   <div className="bg-white/10 p-5 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                     <p className="text-teal-200 text-xs uppercase font-bold mb-1">Return Address</p>
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
                 Nyoranix reserves the right to modify this Policy at any time without prior notice.
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

const ListItem = ({ children, color }) => (
  <li className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition-colors">
    <span className={`w-1.5 h-1.5 bg-${color}-500 rounded-full mt-2 flex-shrink-0`}></span>
    <span className="text-gray-700">{children}</span>
  </li>
);

export default RefundPolicyPage;