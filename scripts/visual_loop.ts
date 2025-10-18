import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

function run(cmd: string) {
    console.log(`\n▶️ ${cmd}`)
    execSync(cmd, { stdio: 'inherit' })
}

function fileExists(p: string): boolean {
    try { fs.accessSync(p, fs.constants.F_OK); return true } catch { return false }
}

async function main() {
    const start = Date.now()

    if (process.env.SKIP_VISUAL_VERIFICATION === '1' || process.argv.includes('--skip')) {
        console.log('🧩 Skipping visual verification loop.')
        process.exit(0)
    }

    // 1) Capture and 2) Verify
    run('pnpm -s capture:visual')
    run('pnpm -s verify:visual')

    // 3) Read verification summary
    const summaryPath = path.join('docs', 'evidence', 'latest', 'verification_summary.json')
    let summary: any[] = []
    try {
        summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'))
    } catch (e: any) {
        console.error('🚨 Failed to read verification summary:', e?.message || e)
        process.exit(1)
    }

    // 4) Print compact report
    let allPass = true
    let shotCount = 0
    let vidCount = 0
    for (const item of summary) {
        const route: string = item.route || 'unknown'
        const canvasReady: boolean = !!item.canvasReady
        const chatVisible: boolean = !!item.chatVisible
        const status: string = item.status || (canvasReady && chatVisible ? 'success' : (canvasReady || chatVisible ? 'partial' : 'fail'))
        const videoName = encodeURIComponent(route) + '.webm'
        const videoPath = path.join('docs', 'evidence', 'latest', 'videos', videoName)
        const videoOk = fileExists(videoPath)
        const shotName = encodeURIComponent(route) + '.png'
        const shotPath = path.join('docs', 'evidence', 'latest', 'screenshots', shotName)
        if (fileExists(shotPath)) shotCount++
        if (videoOk) vidCount++

        const canvasMark = canvasReady ? '✅' : '❌'
        const chatMark = chatVisible ? '✅' : '❌'
        const videoMark = videoOk ? '✅' : '❌'

        console.log(`\nRoute: ${route}\n- Canvas: ${canvasMark}\n- Chat: ${chatMark}\n- Video: ${videoMark}\n- Status: ${status}`)

        if (!canvasReady || !chatVisible) allPass = false
    }

    // Delete stray evidence directly under latest/
    try {
        const latestRoot = path.join('docs', 'evidence', 'latest')
        for (const entry of fs.readdirSync(latestRoot)) {
            if (entry.endsWith('.png') || entry.endsWith('.webm')) {
                try { fs.rmSync(path.join(latestRoot, entry), { force: true }) } catch { }
            }
        }
        console.log('🧹 Cleaned up stale evidence files.')
    } catch { }

    // 5) Exit code and messaging
    const seconds = ((Date.now() - start) / 1000).toFixed(1)
    console.log(`\n📦 Saved: ${shotCount} screenshots, ${vidCount} videos`)
    if (!allPass) {
        console.log('\n🚑 Visual verification failed for one or more routes. Entering surgical fix loop is recommended.')
        console.log(`⏱️ Total runtime: ${seconds}s`)
        process.exit(1)
    } else {
        console.log('\n✅ Visual verification passed for all routes.')
        console.log(`⏱️ Total runtime: ${seconds}s`)
        process.exit(0)
    }
}

main().catch((e) => {
    console.error('🚨 visual_loop error:', e?.message || e)
    process.exit(1)
})


