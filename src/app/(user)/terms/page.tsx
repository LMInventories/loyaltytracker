import { LEGAL } from "@/lib/legal";

export const metadata = {
  title: "Terms of Service — Local Loyalty",
};

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold text-ink">Terms of Service</h1>
        <p className="text-sm text-ink-soft">Last updated {LEGAL.termsLastUpdated}</p>
      </div>

      <div className="flex flex-col gap-6 text-ink-soft [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_p]:leading-relaxed [&_li]:leading-relaxed">
        <section className="flex flex-col gap-2">
          <h2>About these terms</h2>
          <p>
            These terms apply to your use of Local Loyalty, a loyalty rewards app run by{" "}
            {LEGAL.entityName} ({LEGAL.registrationLine}), of {LEGAL.address} (“we”, “us”). By
            creating an account or using the app you agree to them. If you don’t agree, please
            don’t use Local Loyalty. Our{" "}
            <a href="/privacy" className="text-ink underline">
              Privacy Policy
            </a>{" "}
            explains how we handle your personal information.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>What Local Loyalty is</h2>
          <p>
            Local Loyalty lets local businesses run points and stamp schemes and lets customers
            collect them by scanning a QR code in store. The schemes, rewards and offers are set
            and provided by each participating business, not by us. We provide the platform; the
            business is responsible for honouring the rewards it offers.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Your account</h2>
          <ul className="list-disc pl-5">
            <li>You must be at least 13 years old to create an account.</li>
            <li>Give us accurate information and keep your sign-in details secure.</li>
            <li>
              You’re responsible for activity on your account. Tell us promptly if you think
              someone else has got access to it.
            </li>
            <li>One person, one account — please don’t create several to collect extra rewards.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Points, stamps and rewards</h2>
          <ul className="list-disc pl-5">
            <li>
              Points and stamps have no cash value, can’t be sold, transferred or exchanged for
              money, and are only redeemable for the rewards the relevant business offers.
            </li>
            <li>
              Rewards may expire. The expiry date is shown with the reward, and an expired or
              already-redeemed reward can’t be claimed.
            </li>
            <li>
              A business can change or end its scheme, or grant a reward manually. We’ll take
              reasonable care to show changes accurately, but rewards you’ve already unlocked keep
              the wording they had when you unlocked them.
            </li>
            <li>
              To earn points or stamps you scan the business’s live QR code in person. Codes are
              single-use, expire quickly, and there’s a short wait between scans.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5">
            <li>
              earn or redeem rewards fraudulently, including by sharing, photographing or
              automating QR codes, or by getting round the scan limits;
            </li>
            <li>
              attempt to access another person’s account, or any part of the service you’re not
              authorised to use;
            </li>
            <li>
              interfere with the service, probe it for vulnerabilities without our permission, or
              overload it;
            </li>
            <li>use the service for anything unlawful or to harass or mislead others.</li>
          </ul>
          <p>
            If we reasonably believe you’ve broken these terms, we may remove points, stamps or
            rewards obtained unfairly, and suspend or close your account.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>For businesses</h2>
          <p>
            If you run a business on Local Loyalty you’re responsible for the schemes, offers,
            rewards, images and descriptions you publish: they must be accurate, lawful, and not
            infringe anyone’s rights, and you must honour every reward you’ve issued or granted
            through the app. Customer information you see in the app (such as a name or email) may
            only be used to run your loyalty scheme and to speak to that customer about it, in line
            with data protection law. We may remove content or suspend a business that breaks these
            terms.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Availability and changes</h2>
          <p>
            We aim to keep Local Loyalty available and working, but we can’t promise it will always
            be uninterrupted or error-free. We may change, add or remove features, and we may
            update these terms. If a change is material we’ll tell you in the app or by email
            before it takes effect; continuing to use Local Loyalty afterwards means you accept the
            updated terms.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Our responsibility to you</h2>
          <p>
            Nothing in these terms limits or excludes our liability for death or personal injury
            caused by our negligence, for fraud or fraudulent misrepresentation, or for anything
            else that can’t legally be limited, and your statutory consumer rights are unaffected.
          </p>
          <p>
            Subject to that, Local Loyalty is free for customers and provided “as is”. We’re not
            responsible for a business’s failure to provide or honour a reward, and we’re not
            liable for losses we couldn’t reasonably have foreseen, or for lost profits or business
            opportunities. Where we are liable to you for something arising from your use of the
            service, our total liability is limited to £100.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Ending your account</h2>
          <p>
            You can stop using Local Loyalty at any time and ask us to delete your account by
            emailing us at the address below. We can suspend or close an account that breaks these
            terms, or if we stop running the service — in which case we’ll give reasonable notice
            where we can.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>General</h2>
          <p>
            These terms are governed by the law of England and Wales, and the courts of England and
            Wales have jurisdiction, although if you live elsewhere in the UK you may also bring a
            claim in your local courts. If any part of these terms is found to be unenforceable,
            the rest still applies.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>Contact us</h2>
          <p>
            Questions about these terms? Email{" "}
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
