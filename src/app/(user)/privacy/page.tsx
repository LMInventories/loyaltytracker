export const metadata = {
  title: "Privacy Policy — Local Loyalty",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold text-ink">Privacy Policy</h1>
        <p className="text-sm text-ink-soft">Last updated 8 September 2026</p>
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
          </ul>
          <p>
            We don’t collect payment card details, government ID numbers, or precise location
            data, and we don’t use advertising or analytics trackers.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>How we use it</h2>
          <ul className="list-disc pl-5">
            <li>To create and maintain your account and sign you in.</li>
            <li>To record and display your loyalty points, stamps, and rewards.</li>
            <li>To let a business you’ve interacted with see your loyalty activity with them.</li>
            <li>To keep the service secure — for example, rate-limiting to prevent abuse.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Who we share it with</h2>
          <p>
            A business only sees your loyalty activity <em>with that business</em> — your name or
            email, your balance, and your scan/reward history for their schemes. Businesses don’t
            see your activity with other businesses, and we don’t sell or share your information
            with advertisers or data brokers.
          </p>
          <p>
            If you sign in with Google, Google processes your sign-in under its own privacy
            policy. We use Google sign-in only to authenticate you — we don’t request access to
            your Gmail, Drive, or other Google data.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Cookies</h2>
          <p>
            We use a single essential session cookie to keep you signed in. We don’t use
            advertising or third-party tracking cookies.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Data retention and deletion</h2>
          <p>
            We keep your account and loyalty history for as long as your account is active. To
            request deletion of your account and associated data, contact us at the email below.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Security</h2>
          <p>
            Passwords are hashed before storage, and QR codes used to earn rewards are single-use
            and expire within a minute of being generated.
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
            page.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Contact us</h2>
          <p>
            Questions about this policy or your data? Email{" "}
            <a href="mailto:localloyaltydev@gmail.com" className="text-ink underline">
              localloyaltydev@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
