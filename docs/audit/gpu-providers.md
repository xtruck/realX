# GPU rental options for the Path B latency test (research, read 2026-10-21)

Scope: research only. No account created, nothing rented. Guard rails G1-G10 are in `docs/DECISION-PATH-B.md`.
Convention: **SRC** = what a page said (URL given). **INF** = my inference. **UNVERIFIED** / **not found** = could not confirm.
Method caveat: pages were read through a summarising fetch tool, not a browser. Some pages were truncated or came without their live price tables. Prices change; re-read each page before paying. Quotes are as returned by that tool.

## 1. Comparison table (all prices read 2026-10-21)

| Provider | Suitable GPU, on-demand price | Billing | Create/destroy by API/CLI | Europe |
|---|---|---|---|---|
| RunPod | RTX 4090 $0.89/h Secure, $0.34/h Community; L4 $0.59 / $0.44; A5000 $0.27 / $0.16; A40 $0.59 / $0.35; L40S $1.09 / $0.79. A4000 and T4 not listed for Pods. https://www.runpod.io/pricing | Page has a "Per hour / Per second" toggle and mentions "per-second rates"; the default is not stated | Yes: `runpodctl pod create` / `runpodctl pod delete`; REST `POST /v1/pods`, `DELETE /v1/pods/{id}`. https://docs.runpod.io/pods/manage-pods | "30+ regions", none named. EU data-center regions are mentioned, not listed. https://docs.runpod.io/references/security-and-compliance |
| Vast.ai | Live price grid was empty in the fetched page: **no price found**. https://vast.ai/pricing | Per second: "down to the second", no minimum. https://vast.ai/pricing , https://docs.vast.ai/documentation/instances/pricing | A CLI exists (SSH docs mention it). Destroy semantics: stopping does not stop storage billing, deleting does. API create/destroy not explicitly confirmed on pages read | "40+ data centers", regions not named. Europe UNVERIFIED |
| Scaleway | L4-1-24G (8 vCPU, 48 GB RAM, 24 GB GPU) EUR 0.79/h in PAR-1. L40S and H100 listed in PAR-2 with no price shown. https://www.scaleway.com/en/pricing/gpu/ | "metered per minute". https://www.scaleway.com/en/gpu-instances/ | Console, CLI, Terraform; API linked. Same page | Paris (PAR1, PAR2), Warsaw (WAW2); "guaranteed data residency within Europe". Same page |
| Lambda | A10 24 GB $1.29/h; A6000 48 GB $1.09/h; Quadro RTX 6000 24 GB $0.69/h (per GPU). https://lambda.ai/pricing | One-minute increments (docs, seen via search snippet). https://docs.lambda.ai/public-cloud/billing/ | Yes: Cloud API creates, restarts, lists, terminates. https://docs.lambda.ai/public-cloud/on-demand/ | One Europe region listed: europe-central-1 (Germany). Same page |
| OVHcloud | L4 and A10 "From $1 /hour", L40S "From $1.80 /hour"; T4 not listed. USD on that page; EUR not found. https://www.ovhcloud.com/en/public-cloud/gpu/ | Hourly option exists; per-minute not found | not found on pages read | Not listed on pages read (separate availability page). OVH being EU-based is INF, not read |
| Hetzner (dedicated) | GEX45: RTX PRO 4000 Blackwell SFF 24 GB, EUR 0.3429/h or EUR 214/month, **setup fee EUR 209**. GEX63/GEX131: RTX PRO 6000 96 GB, EUR 1.6009 / 2.4022 per hour, setup EUR 999 / 1,499. https://www.hetzner.com/dedicated-rootserver/matrix-gpu/ | Monthly or hourly per model | not found | HEL1 (Finland), FSN1 (Germany); page inconsistent about NBG1 |
| AWS / GCP / Azure spot | **not found**: the AWS spot page fetched had no price table (g6.xlarge L4, g4dn T4 unpriced). https://aws.amazon.com/ec2/spot/pricing/ | not read | not read | not read |
| CoreWeave, Fluidstack, Paperspace/DO | not researched (time-boxed) | | | |

Network latency to western Europe: **no provider page gave a number. All UNVERIFIED.** INF: a Paris, Frankfurt or Helsinki data center is likely tens of ms from a western-European home. The 2-hour test must measure it (ping, then JPEG round trip).

## 2. (d) Exposing an HTTPS endpoint

* **RunPod.** SRC: `https://[POD_ID]-[INTERNAL_PORT].proxy.runpod.net`; "All proxy connections use HTTPS, even when your service runs plain HTTP"; "Cloudflare caps connections at 100 seconds" (HTTP 524). TCP ports via public IP are possible but "UDP is not supported" and external ports change when the pod resets. WebSocket support on the proxy: "The page doesn't say directly". https://docs.runpod.io/pods/configuration/expose-ports
  INF: the proxy terminates TLS at Cloudflare, so a third party handles decrypted frames in transit. It satisfies G2 (DNS name, valid cert) but adds an unmeasured hop. The owner must accept that.
* **Vast.ai.** SRC (via search result): the Instance Portal creates a Cloudflare "trycloudflare.com" tunnel per open port; if tunnels are slow it falls back to raw `http://ip:port`; the https default needs the Vast Jupyter root certificate installed locally; ports map to random external ports on a shared IP. https://docs.vast.ai/guides/instances/connect/networking , https://docs.vast.ai/documentation/instances/connect/jupyter
  INF: quick-tunnel hostnames change per run, which collides with the fixed allow-list in G2. The client must refuse the plain-HTTP fallback.
* **Scaleway, Lambda, OVH, Hetzner.** SRC (Lambda only): inbound rules are set on a Firewall page; only port 22 is open by default. No provider HTTPS proxy was found for these. INF: you get a public IP and need a DNS name you control plus your own certificate (for example Let's Encrypt), or a tunnel you run yourself. G2 forbids IP literals, so a DNS name is mandatory.

## 3. (e) Retention, privacy and acceptable use, per provider

No provider text read names face swap, deepfake or biometric processing explicitly. The clauses below are generic. This is not legal advice.

* **RunPod** (https://www.runpod.io/legal/terms-of-service). Section 6: "You may not use the Site or the Service for any illegal or unauthorized purpose." Section 7: content must not "violate the privacy or publicity rights of any third party" and requires "the written consent, release, and/or permission of each and every identifiable individual person in Your Content to use the name or likeness." Section 2: "we may, but have no obligation to, access, store, process, and use any of Your Content." On terminate: "Terminating permanently deletes all data not stored in a network volume" (https://docs.runpod.io/pods/manage-pods). Isolation: "multi-tenant environment with containerized isolation"; ToS prohibits hosts from inspecting pod data (https://docs.runpod.io/references/security-and-compliance); enforcement unknown. INF: usable for the owner's own face with consent.
* **Vast.ai** (https://vast.ai/terms). Prohibits using the Services to "knowingly post, transmit, upload, link to, send or store any content that is unlawful" and to "Violate any law, rule, or regulation." Personal data is "transferred to and processed in the United States." Host access to client data: the page does not say. Secondary source (search result): "Individual hosts may have less formal security measures"; a "Secure Cloud (Only Trusted Datacenters)" filter exists (https://vast.ai/compliance). Stopped instances keep data on disk, so destroy. Weakest fit for G4 and for faces on unknown hosts unless restricted to datacenter hosts (INF).
* **Scaleway** (https://www.scaleway.com/en/contracts/). The General Terms PDF could not be read (binary text); **prohibited-use and deletion clauses not found.** Abuse docs (search snippet): Scaleway "reserves the right to immediately suspend the infringing services" (https://www.scaleway.com/en/docs/account/support/resolve-abuse/). Owner should read the General Terms of Service (v.09/06/26 is listed) before paying. INF: GDPR applies to biometric images; the owner is both subject and controller of their own data.
* **Lambda** (https://lambda.ai/legal/terms-of-service). Section 2(ix): Customer will not "use the Services for any obscene or unlawful purpose." Section 2(x): will not "submit any sensitive personal data or information to the Services" (examples: government IDs, financial and card data, personal health information). INF: a face image is not in the listed examples but the term is not fully defined in what I read; ask Lambda. 5(d): subcontractors "may access Customer Property". 10(e): on termination Lambda may delete and keep a copy "in accordance with Lambda's data retention practices". Platform Guidelines were truncated in the fetch.
* **OVHcloud.** Terms and acceptable use: **not found / not read.**
* **Hetzner** (https://www.hetzner.com/legal/terms-and-conditions/). 8.2: not to publish content that "infringes on the rights of third parties"; 8.4: may "lock the Customer's access" on illegal activity; 6.4: "The Customer is responsible for the safety and security of all data they store." Data-deletion clause: **not found.**

## 4. (f) Isolation

RunPod: container on a multi-tenant host (SRC). Vast.ai: unprivileged Docker containers on a third-party host (secondary source). OVH: KVM (SRC, https://www.ovhcloud.com/en/public-cloud/gpu/l4/). Scaleway: "a virtual environment" (SRC), VM isolation not stated. Lambda: not found. Hetzner GEX: dedicated server, so no other tenant (INF).

## 5. G4 fit (ephemeral, no retention)

* RunPod: delete via API removes data not on a network volume (SRC). Attach no network volume. Stopping keeps `/workspace` (SRC), so always delete, never stop.
* Vast.ai: delete, not stop (SRC).
* Scaleway, Lambda, OVH: terminate by API; whether the volume is wiped or only released is **not found**. Delete volumes explicitly.
* Hetzner: EUR 209 setup fee makes a throwaway test costly; weaker fit (INF).

## 6. Ranking and test cost (2 hours)

1. **Scaleway L4-1-24G, Paris (PAR-1).** EU data residency, per-minute billing, API/CLI/Terraform, VM-style instance, likely closest to a western-European user (INF). Cost: 2 h x EUR 0.79 = **EUR 1.58**, excluding VAT, plus block volume and public IP charges I did not read (not found). You must set up DNS and a certificate yourself. L4 is slower than a 4090 (INF), so the model may need quantising.
2. **RunPod Secure Cloud RTX 4090.** Fastest GPU in the list at a low hourly price, built-in HTTPS proxy, API/CLI delete, and a ToS clause requiring consent of identifiable people that matches the project consent gate. Cost: 2 h x $0.89 = **$1.78** (Community would be 2 x $0.34 = $0.68 but host trust is unknown). Container disk rate: not found. Cons: Cloudflare in the path, EU availability of the 4090 unverified.

Not first picks: Vast.ai (no price read, host trust, changing tunnel hostnames), Lambda (one EU region, A10 at $1.29/h, "sensitive personal data" clause), Hetzner (EUR 209 setup fee), OVH (prices and terms not read).

## 7. Questions for the owner

1. Budget cap for the test and per month (hard stop, EUR or USD)?
2. Preferred region or country (Paris, Warsaw, Helsinki, Frankfurt)?
3. Accept Cloudflare terminating TLS (RunPod) or require TLS ending on your own server (Scaleway)?
4. Container isolation on a shared host acceptable, or VM only?
5. Which payment method; will you create the account yourself (I will not)?
6. Which model and how much VRAM (24 GB assumed)?
7. Pass mark for fps and end-to-end latency?

## 8. Could not verify

Latency for every provider; Vast.ai prices; OVH EUR prices and terms; AWS/GCP/Azure/CoreWeave/Fluidstack/Paperspace; Scaleway General Terms text; Hetzner data deletion and whether the setup fee applies to hourly billing; volume wipe behaviour for Scaleway, Lambda, OVH; RunPod proxy WebSocket support; RunPod and Scaleway EU region availability for the named GPUs; whether RunPod per-second billing is the default.
