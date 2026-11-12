# Art Studio (optional AI portraits)

The Art Studio is optional and off until a player sets it up. It never comes with a key or an account; players
connect a generator they already run or pay for.

On a finished card press **Generate AI art**. The studio builds an image prompt from two sources:

- **The character:** race look, hair, eyes, outfit, weapon, power, element, companion, personality and power level.
- **The arena:** the latest fight, scars and allies.

You can then:

1. Edit the prompt.
2. Pick a style and framing.
3. Optionally have a language model polish it.
4. Send it to a generator.

| Generator | Where it runs | Setup |
| --- | --- | --- |
| Stable Diffusion WebUI (AUTOMATIC1111 / Forge) | Your PC | Start with `--api --cors-allow-origins=*` |
| ComfyUI | Your PC | Start with `--enable-cors-header "*"` |
| Custom OpenAI-compatible | Your PC or any service | Any `/images/generations` address (LocalAI, proxies) |
| OpenAI (ChatGPT image model) | Online | Your own API key from platform.openai.com |
| xAI (Grok image model) | Online | Your own API key from console.x.ai |
| Stability AI | Online | Your own API key |
| Google Gemini image | Online | Your own API key |

| Language model (optional prompt polish and saga writer) | Where it runs | Setup |
| --- | --- | --- |
| Ollama | Your PC | Set `OLLAMA_ORIGINS=*`, restart Ollama |
| LM Studio | Your PC | Start the local server, switch on "Enable CORS" |
| Custom OpenAI-compatible | Your PC or any service | Any `/chat/completions` address |
| OpenAI, xAI Grok, Anthropic Claude | Online | Your own API key |

**Limits and cost.** The provider bills each picture to your API key, and API keys have rate limits. A chat
subscription (ChatGPT Plus, SuperGrok, Gemini Advanced) does not include API use. For online generators the
studio shows a warning and stops after a daily number of pictures you set (10 by default).

**Using a subscription instead of a key.** A subscription can't be signed into from another app, so the studio
has a two-step route:

1. **Copy prompt and open ChatGPT / Grok / Gemini** opens the site with the prompt, where you sign in as usual.
2. Bring the picture back with **Choose the saved picture**, or paste it (Ctrl+V).

Those plans have their own picture limits.

**Privacy.**

- **Where keys go:** keys are sent only to the address shown in the studio.
- **Keys in memory:** keys stay in memory unless you tick **Remember API keys**, which stores them unencrypted in
  that browser. Exported saves never include keys.
- **The portrait:** it goes on the card, is exported with **Save PNG**, and is saved with the legend in the
  Hall of Legends on that device.
- **What leaves the device:** only the character description is sent to the provider you choose.

The connectors are tested against local stand-in servers that mimic each service's request and reply format.
They haven't been called with real keys, so model names or formats may need adjusting if a provider changes its
API. The base URL and model can be edited for every provider.

On the desktop app, links to ChatGPT, Grok and Gemini open in your normal browser. A generator on another
computer in your network must be reachable over `https`, or run on the same PC (`localhost`/`127.0.0.1`).
