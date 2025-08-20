'use client';

import React from "react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 pt-10">Terms of Use</h1>
          <p className="text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
          <p className="mb-4">
            Welcome to Niajee (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). Niajee is an all-in-one social media platform that centralizes long videos, short-form content, and community-driven discussions into one unified experience. These Terms of Use (&quot;Terms&quot;) govern your access to and use of our website, mobile applications, and other services (collectively, the &quot;Services&quot;). By using our Services, you agree to be bound by these Terms. If you do not agree with these Terms, please do not use our Services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">2. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using the Niajee Services, you confirm that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy. If you do not agree with any part of these Terms, your sole remedy is to discontinue using the Services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">3. Changes to the Terms</h2>
          <p className="mb-4">
            Niajee reserves the right to modify or replace these Terms at any time. We will provide notice of any significant changes either through our Services or by other reasonable means. Your continued use of the Services following the posting of changes constitutes your acceptance of such changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">4. User Accounts and Registration</h2>
          <p className="mb-4">
            In order to access certain features of our Services, you may be required to register for an account. You agree to provide accurate and complete information during the registration process and to update such information as necessary. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">5. Prohibited Conduct</h2>
          <p className="mb-4">
            You agree not to engage in any activity that interferes with or disrupts the Services or the servers and networks connected to the Services. Prohibited conduct includes, but is not limited to:
          </p>
          <ul className="list-disc ml-8 mb-4">
            <li>Using the Services for any unlawful purposes.</li>
            <li>Uploading or distributing viruses, malware, or other harmful software.</li>
            <li>Harassing, abusing, or harming other users.</li>
            <li>Attempting to gain unauthorized access to any part of the Services.</li>
            <li>Collecting or storing personal information of other users without their consent.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">6. Content and Intellectual Property</h2>
          <p className="mb-4">
            All content provided on the Niajee Services, including text, graphics, logos, images, audio clips, video clips, and software, is the property of Niajee or its licensors and is protected by international copyright, trademark, and other intellectual property laws.
          </p>
          <p className="mb-4">
            You are granted a limited, non-exclusive, non-transferable, revocable license to use the Services for your personal, non-commercial use, subject to these Terms.
          </p>
          <p className="mb-4">
            You agree not to reproduce, modify, distribute, display, perform, or create derivative works of any part of the Services without our prior written consent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">7. Third-Party Links</h2>
          <p className="mb-4">
            Our Services may contain links to third-party websites or services that are not owned or controlled by Niajee. We are not responsible for the content, privacy policies, or practices of any third-party sites or services. You acknowledge and agree that Niajee shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with your use of or reliance on any such content, goods, or services available on or through any such site or service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">8. Disclaimers</h2>
          <p className="mb-4">
            The Services are provided on an &quot;as is&quot; and &quot;as available&quot; basis without any warranties of any kind, either express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </p>
          <p className="mb-4">
            Niajee does not warrant that the Services will be uninterrupted, error-free, or completely secure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">9. Limitation of Liability</h2>
          <p className="mb-4">
            To the fullest extent permitted by applicable law, Niajee shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc ml-8 mb-4">
            <li>Your access to or use of or inability to access or use the Services;</li>
            <li>Any conduct or content of any third party on the Services;</li>
            <li>Any content obtained from the Services; and</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">10. Indemnification</h2>
          <p className="mb-4">
            You agree to indemnify, defend, and hold harmless Niajee, its affiliates, and their respective officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, or expenses, including reasonable attorneys&apos; fees, arising out of or in any way connected with your access to or use of the Services or your violation of these Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">11. Governing Law</h2>
          <p className="mb-4">
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Niajee operates, without regard to its conflict of law provisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">12. Termination</h2>
          <p className="mb-4">
            Niajee reserves the right to suspend or terminate your access to the Services at any time, without notice, for conduct that Niajee believes violates these Terms or is harmful to other users of the Services or to the business interests of Niajee.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">13. Miscellaneous</h2>
          <p className="mb-4">
            These Terms constitute the entire agreement between you and Niajee regarding your use of the Services and supersede any prior agreements between you and Niajee regarding your use of the Services.
          </p>
          <p className="mb-4">
            If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms
            will otherwise remain in full force and effect and enforceable.
            </p>    
        </section>
        </div>
        </div>
  )
}