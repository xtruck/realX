# One-off remote trial with the owner's own face: plan and consent

**Status: prepared, NOT started.** Nothing has been sent anywhere, no account has been created, no key has been requested, no code was
written for this. It starts only when the owner says so in writing. Written 2026-10-24.

## Purpose

Find out, with one short test, what a hosted real-time editing model really gives on **the owner's own face and body**: picture quality,
delay, stability, and what it costs. The result decides whether a remote-GPU tier (`FULLBODY-REALTIME-FEASIBILITY.md`, tiers B and C) is
worth designing. It is a measurement, not a feature: realX's code and its rule "camera pictures never leave the page" are **not
changed** by this trial.

## Scope (hard limits)

| Limit | Value |
|---|---|
| Whose face and body | The owner's only. No other person is in the picture, in the room's video, or in a reference image. |
| Reference image | One photo, **of the owner** (or a clearly labelled non-person, for example an animal costume). Never another real person's photo. |
| Vendor | One: Decart (Lucy models), because its public documentation was read; nothing else is contacted. |
| Where it runs | The vendor's own web tool or the owner's own account on the vendor's page. **Not through realX.** No realX code sends anything. |
| Who operates it | The owner, on the owner's own account and payment method. An agent does not create accounts, sign in, enter payment details or press "start". |
| Length | One session, at most 3 minutes of generation in total. |
| Cost cap | See the next table. No spending limit is documented by the vendor, so the cap is what the owner chooses to load, or the free credits. |
| Recording | None kept. No download of the output unless the owner decides afterwards to keep a clip of their own. |

## What the vendor says (public pages read 2026-10-24)

| Topic | What the pages say | What they do not say |
|---|---|---|
| Price | Billed per second of active generation, all real-time models at 720p: `lucy-2.5` $0.02/s standard or $0.04/s fast mode; `lucy-restyle-2` $0.01/s. Pay as you go, no minimum spend. New accounts get free credits, **amount not stated**. | A concurrency limit. Whether the figures change. |
| Cost of the trial | 3 minutes = 180 s: about **$3.60** (standard `lucy-2.5`), **$7.20** (fast), **$1.80** (`lucy-restyle-2`). With free credits it may cost nothing. | |
| What is collected | Content, account details and "audio and video live recordings" you provide | |
| How long it is kept | "Until deleted" by the vendor or after a valid deletion request, with legal exceptions | **No fixed period** |
| Used to improve the service or for research | The purposes listed include improving the platform and research; data may be anonymised and used internally and externally | Whether live video is used to train models: **not stated explicitly** |
| Biometric or face data | | **Not mentioned at all** |
| Shared with third parties | The video-model section lists none | |
| Acceptable use | Deepfakes or impersonation of a real person are **prohibited without clear, conspicuous disclosure and verifiable consent**; machine-readable marks such as watermarks must not be removed | The format or place of a visible label |

Meaning for the owner: with the owner's own face, the vendor's own consent rule is satisfied by the owner's consent, but the owner is
handing over live video of their face to a service that keeps data until deleted and has not said whether it counts as biometric data.
That is the real cost of the trial. Ask the vendor to delete the session data afterwards (checklist item 9).

## Before starting (owner ticks each box)

1. [ ] I read the table above and accept that live video of my face goes to the vendor's servers for this test.
2. [ ] I am alone in the room, nobody else can appear in the camera, and no screen shows other people's faces or private documents.
3. [ ] Nothing private is in view (documents, other windows, mail, children's photos, house numbers).
4. [ ] I created the vendor account myself. **The vendor's FAQ states no spending limit**, so I use only the free evaluation credits, or load at most the small amount I accept to lose, and I turn off any automatic top-up.
5. [ ] The reference photo is of me (or a labelled non-person) and I own the rights to it.
6. [ ] I signed the consent below (typed name and date are enough; keep it in this repository's `docs/`, not in the vendor's tool).
7. [ ] I will keep the on-screen note "AI-edited video, my own face, test" visible in the picture during the session.
8. [ ] I will stop the session at the first sign of anything wrong (I do not need to finish the 3 minutes).
9. [ ] Afterwards I ask the vendor to delete my session data (the privacy policy says data is kept until deleted; **the FAQ gives no self-service route**, so write to the contact address in the privacy policy) and note the date and any reference below.

## Session script (3 minutes)

| Minute | Do | Measure |
|---|---|---|
| 0:00 | Start with the reference photo and a short instruction (for example "make me look like the person in the photo"). Say the time out loud. | Time from pressing start to the first edited frame, by phone stopwatch (rough: ±0.5 s). |
| 0:20 | Sit still, face the camera, neutral face. | Picture quality 1-5; does the face look like the photo? |
| 0:50 | Turn your head left and right, about 45°. | Does the identity hold? Any flicker or melting? |
| 1:20 | Talk for 10 s; smile; raise one hand near the face. | Mouth, teeth, hands: 1-5 each. |
| 1:50 | Stand up so arms and torso are in view; lift both arms. | Does the body follow? Do clothes keep their look? |
| 2:30 | Wave a hand fast; leave the frame and come back. | Does the edit survive leaving and returning? |
| 3:00 | Stop. | Total billed seconds on the vendor's usage page. |

Delay without special tools: record your screen with the phone (a second camera filming both you and the screen), then count frames
between a hand movement and the same movement in the edited picture. Write it as a range, not a single figure.

## Results table (owner fills in; empty on purpose)

| Item | Result |
|---|---|
| Date, laptop, network (wifi or cable), upload speed | |
| Model used and mode (standard or fast) | |
| Time to first edited frame (s) | |
| Delay between movement and edited movement (range, ms) | |
| Quality 1-5: still face / head turns / mouth and teeth / hands / body and clothes | |
| Identity held when turning and when leaving and returning? | |
| Did anything look wrong or unsafe (other people, text on screen, private items)? | |
| Billed seconds and cost | |
| Deletion requested on (date) and reference | |

## What happens with the result

| Result | Next step |
|---|---|
| Delay and quality good enough, owner still wants it | Design a remote tier **with** a per-session consent bound to the stream, a sender that cannot start without it, the visible "Virtual" label burned into the returned frames, and tests that prove nothing leaves while remote mode is off. This needs the owner's written change to `MISSION.md` decision 3. |
| Quality good, delay too high | Look at a closer region, a nearer data centre, or a smaller model; re-measure. |
| Quality not good enough | Stay with tier A and improve the local compositor. |

## Consent (the owner signs for themself)

> I, ______________________ (full name), consent to my own face and body being captured by my laptop's camera and sent over the internet
> to ______________________ (vendor) for a single test of about 3 minutes on ____ / ____ / ______. I understand that the vendor keeps
> data until it is deleted, that its privacy policy does not say how live video is classed or whether it is used for training, and that I will
> ask for deletion afterwards. I am the only person shown. I own or may use the reference image. The result will be marked as AI-edited
> wherever it is shown, and I will not present it as real video of me or of anyone else. I can stop at any moment.
>
> Signed (typed name): ______________________   Date: ____ / ____ / ______

## What an agent will and will not do for this trial

- **Will:** keep this plan up to date, answer questions about it, and later read the owner's filled-in results to write them up.
- **Will not:** create the vendor account, sign in, enter payment details or keys, start the session, send any image or video, or touch
  the vendor's servers in any way. Those steps are the owner's.
