# Path B link: how to run it (branch `gpu-link-impl`)

Status: transport only. A neutral passthrough filter, **no model, no weights, no licence question touched**. See `docs/DECISION-PATH-B.md`
for the decision and the guard rails G1 to G10; `tests/test_gpulink_*.py` is where each one is proved.

## Pieces

| Where | What |
|---|---|
| `src/realx/gpulink/config.py` | `GpuLinkConfig`: off by default, https + DNS-name allow-list, budget at most 1 s |
| `src/realx/gpulink/client.py` | `GpuLinkClient.send(frame, consent_id)`: one JPEG out, one JPEG back, or `None` (keep the local picture) |
| `src/realx/gpulink/stage.py` | `GpuLinkStage`: a pipeline stage; strict pipelines need a consent gate before it and the label + watermark after it |
| `gpu_server/` | the server for the rented machine (top level, not part of the `realx` wheel); `python -m gpu_server --ephemeral` |

## Running a session

On the rented machine (created for this session, destroyed after, no snapshot):

    GPU_SERVER_TOKEN=<random, 16+ chars> python -m gpu_server --ephemeral --port 8443

It binds 127.0.0.1; put TLS in front (the provider's HTTPS port or a reverse proxy). It refuses to start without `--ephemeral` and a token.

On your machine:

    export REALX_GPULINK_TOKEN=<the same token>           # read at send time, never stored
    link = GpuLinkConfig(enabled=True, url="https://<name>", allowed_hosts=("<name>",))
    client = GpuLinkClient(link, consent_check=<returns False once the consent is revoked>)
    chain = [ConsentGate(...), GpuLinkStage(client, consent_id), Disclosure("<name>"), Watermark(...)]
    Pipeline(chain, strict=True, allow=[GpuLinkStage])

`client.status()` is what the UI should show: whether frames are leaving the machine, to which host, counts, last error code.

## Behaviour worth knowing

* One attempt per frame, at most `budget_s` (default and maximum 1 s). On timeout, error, bad answer or revoked consent the frame is not
  replaced and goes through the same label and watermark. Frames arriving while one is out, or faster than `max_fps`, are dropped.
* Error codes in `status()["last_error"]` are fixed words (`timeout`, `connect`, `tls`, `no-token`, `consent`, `bad-image`, ...), never server text.
* The server never receives the label or the watermark; both are drawn locally after the answer arrives.
* Not done here (needs the owner): a provider account and spending cap for the real-GPU latency test, and any model.
