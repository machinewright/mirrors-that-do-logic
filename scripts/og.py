# Renders og.png (1200x630): the title next to the one-clause OR board.
# Needs the local server: python3 -m http.server 8773 --bind 127.0.0.1 (from the repo root).
import asyncio, base64
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 700, 'height': 900}, device_scale_factor=2, reduced_motion='reduce')
        pg = await ctx.new_page()
        await pg.goto('http://127.0.0.1:8773/index.html'); await pg.wait_for_timeout(1200)
        w = (await pg.query_selector_all('.widget'))[2]
        png = await (await w.query_selector('canvas')).screenshot()
        card = await b.new_page(viewport={'width': 1200, 'height': 630})
        serif = base64.b64encode(open('fonts/source-serif-4-latin-opsz-normal.woff2', 'rb').read()).decode()
        sans = base64.b64encode(open('fonts/inter-latin-wght-normal.woff2', 'rb').read()).decode()
        await card.set_content(f'''<style>
          @font-face {{ font-family: S; font-weight: 200 900; src: url(data:font/woff2;base64,{serif}) format("woff2"); }}
          @font-face {{ font-family: I; font-weight: 100 900; src: url(data:font/woff2;base64,{sans}) format("woff2"); }}
          </style><body style="margin:0;width:1200px;height:630px;background:#fbf9f4;display:flex;align-items:center">
          <div style="flex:1;padding:0 40px 0 72px;color:#1f2430">
            <div style="font:650 70px/1.05 S;letter-spacing:-1.5px">Mirrors that do&nbsp;logic</div>
            <div style="font:400 28px/1.4 S;color:#3d4452;margin-top:26px">Why no program is expected to solve every mirror puzzle fast. Build the reason yourself.</div>
            <div style="font:500 20px/1.4 I;color:#646b78;margin-top:30px">An interactive essay · Machinewright</div>
          </div>
          <img src="data:image/png;base64,{base64.b64encode(png).decode()}" style="height:540px;width:auto;margin-right:70px;border-radius:16px;box-shadow:0 12px 30px -12px rgba(20,24,33,.5)">
        </body>''')
        await card.wait_for_timeout(300)
        await card.screenshot(path='og.png')
        await b.close()
asyncio.run(main())
