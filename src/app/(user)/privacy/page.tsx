import { LEGAL } from "@/lib/legal";

export const metadata = {
  title: "Privacy Policy — Local Loyalty",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold text-ink">Privacy Policy</h1>
        <p className="text-sm text-ink-soft">Last updated {LEGAL.privacyLastUpdated}</p>
      </div>

      <div className="flex flex-col gap-6 text-ink-soft [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_p]:leading-relaxed [&_li]:leading-relaxed">
        <section className="flex flex-col gap-2">
          <p>
            Local Loyalty (“we”, “us”) runs a loyalty rewards app that lets participating local
            businesses track points and stamps for their customers. This page explains what
            information we collect, how we use it, and who we share it with.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Who we are</h2>
          <p>
            Local Loyalty is run by {LEGAL.entityName} ({LEGAL.registrationLine}), of{" "}
            {LEGAL.address}. We are the “data controller” for the personal information described
            on this page. We are registered with the Information Commissioner’s Office (ICO)
            under number {LEGAL.icoRegistrationNumber}.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Information we collect</h2>
          <ul className="list-disc pl-5">
            <li>
              <strong className="text-ink">Account information:</strong> your email address and,
              if you provide one, your name. If you sign in with email and password, we store a
              securely hashed version of your password — we never store the password itself. If
              you sign in with Google, we receive your name, email address, and profile picture
              from Google; we don’t receive your Google password.
            </li>
            <li>
              <strong className="text-ink">Loyalty activity:</strong> which businesses you’ve
              scanned a code with, your points/stamp balance at each one, and a history of each
              scan and reward you’ve earned or redeemed.
            </li>
            <li>
              <strong className="text-ink">Push notification subscription:</strong> only if you
              explicitly turn push notifications on in Account settings, your browser gives us a
              subscription endpoint, encryption keys and your browser’s user-agent string (which
              identifies the browser and device type) so we can deliver a notification. We don’t
              receive this unless you opt in, and turning notifications off deletes it.
            </li>
          </ul>
          <p>
            We don’t collect payment card details, government ID numbers, or precise (GPS) location
            data, and we don’t use advertising or analytics trackers. We may temporarily see your
            IP address in server logs and use it for rate-limiting to prevent abuse.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Why we ask for your name and email</h2>
          <p>We only ask for two things to create an account, and here is exactly why:</p>
          <ul className="list-disc pl-5">
            <li>
              <strong className="text-ink">Email address (required):</strong> it is your login and
              how we tell your account apart from everyone else’s, so your points and stamps stay
              yours. We also use it to send the service emails you’d expect — a welcome email, a
              note when you unlock a reward, and a reminder before a reward expires (you can turn
              these off in Account settings). A business you’ve collected stamps with can also see
              it, so it can recognise you and look up your card.
            </li>
            <li>
              <strong className="text-ink">First name (optional):</strong> we use it to greet you
              in the app and in our emails, and so staff at a business you’ve visited can recognise
              you when they look up your card or give you a reward. You can leave it blank and
              still use every feature.
            </li>
          </ul>
          <p>
            We don’t use either for advertising, we don’t sell them, and we don’t ask for anything
            else (such as your phone number or date of birth) to sign up.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>How we use it</h2>
          <ul className="list-disc pl-5">
            <li>
              To create and maintain your account and sign you in — necessary to provide the
              service you’ve signed up for.
            </li>
            <li>
              To record and display your loyalty points, stamps, and rewards — necessary to
              provide the service.
            </li>
            <li>
              To let a business you’ve interacted with see your loyalty activity with them —
              necessary to provide the service.
            </li>
            <li>
              To send you service emails (a welcome email, a reward-unlocked email, a
              reward-expiring reminder) — necessary to provide the service. These aren’t marketing
              and you can still turn them off in Account settings.
            </li>
            <li>
              To send you push notifications (a reward you’ve unlocked, a new offer from a
              business you’ve visited, or a reminder if you haven’t visited in a while) — only if
              you’ve explicitly turned this on in Account settings. You can turn off push
              notifications generally, or just the “haven’t visited in a while” reminder, at any
              time.
            </li>
            <li>
              To keep the service secure — for example, rate-limiting to prevent abuse — based on
              our legitimate interest in keeping the platform safe and reliable.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Who we share it with</h2>
          <p>
            A business only sees your loyalty activity <em>with that business</em> — your name or
            email, your balance, and your scan/reward history for their schemes. Businesses don’t
            see your activity with other businesses, and we don’t sell or share your information
            with advertisers or data brokers. Once a business has seen your name or email as part of
            running its own loyalty scheme, it holds that information for its own purposes and is
            responsible for it under data protection law; you can ask that business directly how it
            uses it.
          </p>
          <p>
            If you sign in with Google, Google processes your sign-in under its own privacy
            policy. We use Google sign-in only to authenticate you — we don’t request access to
            your Gmail, Drive, or other Google data.
          </p>
          <p>
            We also use a small number of service providers to run Local Loyalty: Railway (hosts
            our database and servers), Resend (sends our service emails), and — only if you opt in
            to push notifications — your browser’s own push service (for example Google’s Firebase
            Cloud Messaging, Mozilla’s push service, or Apple’s push service, depending on your
            browser) to deliver the notification. These providers only
            process your data to help us run the service — they don’t use it for their own
            purposes. Some of these providers may process data outside the UK/EEA (for example, in
            the US). Where that happens, we rely on legal safeguards such as Standard Contractual
            Clauses or the provider’s own equivalent UK-approved transfer mechanism to protect your
            data.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Cookies</h2>
          <p>
            We only use cookies and browser storage that are strictly necessary to run the
            service, so we don’t show a cookie consent banner. These are: a session cookie that keeps
            you signed in; short-lived security cookies set by our sign-in system (to prevent
            cross-site request forgery and to remember where to send you after you sign in); and a
            small piece of browser storage that remembers your light/dark theme choice and whether
            you’ve dismissed the “install the app” banner. If you install Local Loyalty on your
            device, your browser may also cache pages so the app can load offline. We don’t use
            advertising or third-party tracking cookies.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Data retention</h2>
          <p>
            We keep your account and loyalty history for as long as your account is active. If you
            ask us to delete your account, we’ll delete or anonymise your personal information
            (your name, email, and login credentials) without unreasonable delay — we keep a
            minimal, de-identified record of past scans and redemptions where we need to for fraud
            prevention or to meet a legal obligation, but it will no longer identify you.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Your rights</h2>
          <p>Under UK data protection law, you have the right to:</p>
          <ul className="list-disc pl-5">
            <li>Ask for a copy of the personal data we hold about you (access).</li>
            <li>Ask us to correct inaccurate or incomplete data (rectification).</li>
            <li>Ask us to delete your data, subject to the limits above (erasure).</li>
            <li>Ask us to give you your data in a portable format (portability).</li>
            <li>Object to, or ask us to restrict, certain processing.</li>
          </ul>
          <p>
            To exercise any of these rights, email us at the address below — we’ll respond within one month. If you’re unhappy with
            how we’ve handled your data, you also have the right to complain to the UK’s data
            protection regulator, the{" "}
            <a
              href="https://ico.org.uk/make-a-complaint/"
              className="text-ink underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Information Commissioner’s Office (ICO)
            </a>
            .
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Security</h2>
          <p>
            Passwords are hashed before storage, sign-in and sign-up attempts are rate-limited to
            prevent guessing, and QR codes used to earn rewards are single-use and expire within a
            minute of being generated. No system is completely secure, but if a personal data
            breach is likely to put you at risk we will tell you and the ICO as the law requires.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Children’s privacy</h2>
          <p>
            Local Loyalty is not directed at children under 13, and we don’t knowingly collect
            information from them.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Changes to this policy</h2>
          <p>
            If we make material changes to this policy, we’ll update the date at the top of this
            page and, where the change affects how we use your data, let you know by email or in
            the app.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Contact us</h2>
          <p>
            Questions about this policy or your data? Email{" "}
            <a href={`mailto:${LEGAL.contactEmail}`} className="text-ink underline">
              {LEGAL.contactEmail}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
