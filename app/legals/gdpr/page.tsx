'use client';

import React from "react";
import Link from "next/link";

export default function GDPRPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 pt-10">GDPR Compliance</h1>
          <p className="text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
          <p className="mb-4">
            This General Data Protection Regulation (GDPR) compliance statement explains how Mosaic ("we", "us", or "our") ensures compliance with the GDPR, a regulation in EU law on data protection and privacy for all individuals within the European Union and the European Economic Area. It addresses how we collect, use, protect, and share personal data of EU residents.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">2. Data Controller Information</h2>
          <p className="mb-4">
            Mosaic acts as a data controller for the personal information collected through our Services. As a data controller, we determine the purposes and means of processing personal data.
          </p>
          <p className="mb-4">
            Our contact details are:
          </p>
          <ul className="list-disc ml-8 mb-4">
            <li>Company Name: Mosaic Social Media Ltd</li>
            <li>Address: 123 Tech Avenue, Digital City, DC1 2EF, United Kingdom</li>
            <li>Email: dpo@mosaic-social.com</li>
            <li>Phone: 07000000998847</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">3. Data Protection Officer</h2>
          <p className="mb-4">
            We have appointed a Data Protection Officer (DPO) who is responsible for overseeing questions in relation to this GDPR compliance statement. If you have any questions about this statement, including any requests to exercise your legal rights, please contact the DPO using the details set out below:
          </p>
          <ul className="list-disc ml-8 mb-4">
            <li>Name: Data Protection Officer</li>
            <li>Email: dpo@mosaic-social.com</li>
            <li>Phone: 07000000998847</li>
            <li>Address: 123 Tech Avenue, Digital City, DC1 2EF, United Kingdom</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">4. Lawful Basis for Processing</h2>
          <p className="mb-4">
            Under the GDPR, we must have a lawful basis for processing your personal data. We process your personal data on the following lawful grounds:
          </p>
          <ul className="list-disc ml-8 mb-4">
            <li>
              <strong>Consent:</strong> Where you have given us explicit consent to process your personal data for a specific purpose.
            </li>
            <li>
              <strong>Contract:</strong> Where processing is necessary for the performance of a contract to which you are a party or to take steps at your request before entering into such a contract.
            </li>
            <li>
              <strong>Legal Obligation:</strong> Where processing is necessary for compliance with a legal obligation to which we are subject.
            </li>
            <li>
              <strong>Legitimate Interests:</strong> Where processing is necessary for the purposes of the legitimate interests pursued by us or by a third party, except where such interests are overridden by your interests or fundamental rights and freedoms.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">5. Your Rights Under GDPR</h2>
          <p className="mb-4">
            Under the GDPR, you have the following rights:
          </p>
          <ul className="list-disc ml-8 mb-4">
            <li>
              <strong>Right to Access:</strong> You have the right to request copies of your personal data that we hold.
            </li>
            <li>
              <strong>Right to Rectification:</strong> You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.
            </li>
            <li>
              <strong>Right to Erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.
            </li>
            <li>
              <strong>Right to Restrict Processing:</strong> You have the right to request that we restrict the processing of your personal data, under certain conditions.
            </li>
            <li>
              <strong>Right to Object to Processing:</strong> You have the right to object to our processing of your personal data, under certain conditions.
            </li>
            <li>
              <strong>Right to Data Portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.
            </li>
            <li>
              <strong>Rights Related to Automated Decision Making and Profiling:</strong> You have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning you or similarly significantly affects you.
            </li>
          </ul>
          <p className="mb-4">
            To exercise any of these rights, please contact our DPO using the contact details provided above. We will respond to your request within one month.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">6. Data Security</h2>
          <p className="mb-4">
            We have implemented appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including:
          </p>
          <ul className="list-disc ml-8 mb-4">
            <li>Encryption of personal data where appropriate</li>
            <li>Regular testing, assessing, and evaluating the effectiveness of technical and organizational measures</li>
            <li>Ability to ensure the ongoing confidentiality, integrity, availability, and resilience of processing systems and services</li>
            <li>Ability to restore the availability and access to personal data in a timely manner in the event of a physical or technical incident</li>
            <li>Process for regularly testing, assessing, and evaluating the effectiveness of technical and organizational measures for ensuring the security of the processing</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">7. Data Breach Procedures</h2>
          <p className="mb-4">
            In the case of a personal data breach, we will notify the relevant supervisory authority within 72 hours of becoming aware of the breach, where feasible, unless the breach is unlikely to result in a risk to the rights and freedoms of natural persons.
          </p>
          <p className="mb-4">
            When the personal data breach is likely to result in a high risk to your rights and freedoms, we will communicate the personal data breach to you without undue delay.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">8. International Transfers</h2>
          <p className="mb-4">
            We may transfer your personal data to countries outside the European Economic Area (EEA). Whenever we transfer your personal data out of the EEA, we ensure a similar degree of protection is afforded to it by ensuring at least one of the following safeguards is implemented:
          </p>
          <ul className="list-disc ml-8 mb-4">
            <li>Transferring to countries that have been deemed to provide an adequate level of protection for personal data by the European Commission.</li>
            <li>Using specific contracts approved by the European Commission which give personal data the same protection it has in Europe.</li>
            <li>For transfers to the US, ensuring the receiving entity is part of the Privacy Shield or implementing Standard Contractual Clauses.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">9. Data Retention</h2>
          <p className="mb-4">
            We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
          </p>
          <p className="mb-4">
            To determine the appropriate retention period for personal data, we consider the amount, nature, and sensitivity of the personal data, the potential risk of harm from unauthorized use or disclosure of your personal data, the purposes for which we process your personal data and whether we can achieve those purposes through other means, and the applicable legal requirements.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">10. Changes to This GDPR Compliance Statement</h2>
          <p className="mb-4">
            We may update our GDPR compliance statement from time to time. We will notify you of any changes by posting the new statement on this page. We encourage you to review this statement periodically for any changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">11. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this GDPR compliance statement, please contact us:
          </p>
          <ul className="list-disc ml-8 mb-4">
            <li>By phone: 07000000998847</li>
            <li>By visiting this page on our website: <Link href="/legals/contact-us" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">mosaic-social.com/legals/contact-us</Link></li>
            <li>By email: dpo@mosaic-social.com</li>
          </ul>
        </section>

        <footer className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Mosaic. All rights reserved.
        </footer>
      </div>
    </div>
  );
}