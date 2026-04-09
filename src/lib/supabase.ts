import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)$ bun run dev
$ next dev
▲ Next.js 16.2.3 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.56.1:3000
- Environments: .env
✓ Ready in 626ms
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy

⨯ ERROR: This build is using Turbopack, with a `webpack` config and no `turbopack` config.    
   This may be a mistake.

   As of Next.js 16 Turbopack is enabled by default and
   custom webpack configurations may need to be migrated to Turbopack.

   NOTE: your `webpack` config may have been added by a configuration plugin.

   To configure Turbopack, see https://nextjs.org/docs/app/api-reference/next-config-js/turbopack

   TIP: Many applications work fine under Turbopack with no configuration,
   if that is the case for you, you can silence this error by passing the
   `--turbopack` or `--webpack` flag explicitly or simply setting an
   empty turbopack config in your Next config file (e.g. `turbopack: {}`).

error: script "dev" exited with code 1