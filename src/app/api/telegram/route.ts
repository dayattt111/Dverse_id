import { NextResponse } from 'next/server'
import {
  helpCommand,
  infoCommand,
  totalCommand,
  statusCommand,
  recentCommand,
  cariCommand,
} from './commands'

interface TelegramUpdate {
  message?: {
    chat: { id: number }
    text?: string
  }
}

async function sendMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  })
}

export async function POST(request: Request) {
  try {
    const update: TelegramUpdate = await request.json()
    const message = update.message

    if (!message?.text) {
      return NextResponse.json({ ok: true })
    }

    const chatId = message.chat.id
    const [rawCmd, ...argParts] = message.text.trim().split(' ')
    const command = rawCmd.split('@')[0].toLowerCase()
    const args = argParts.join(' ')

    let reply: string

    switch (command) {
      case '/help':
      case '/start':
        reply = helpCommand()
        break
      case '/info':
        reply = infoCommand()
        break
      case '/total':
        reply = await totalCommand()
        break
      case '/status':
        reply = await statusCommand()
        break
      case '/recent':
        reply = await recentCommand()
        break
      case '/cari':
        reply = await cariCommand(args)
        break
      default:
        reply = 'Perintah tidak dikenali. Ketik /help untuk melihat daftar perintah.'
    }

    await sendMessage(chatId, reply)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ ok: true })
  }
}
