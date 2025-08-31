import { z } from 'zod'
import { exec } from '@actions/exec'

export const GoModInfoSchema = z.object({
  module: z.string().min(1),
  packages: z.array(z.string().min(1))
})

export type GoModInfo = z.infer<typeof GoModInfoSchema>

export async function getGoModInfo(): Promise<GoModInfo> {
  const readModule = async () => {
    let stdout = ''
    let stderr = ''
    const result = await exec('go', ['list', '-m'], {
      listeners: {
        stdout: (data) => {
          stdout += data.toString()
        },
        stderr: (data) => {
          stderr += data.toString()
        }
      }
    })
    if (result !== 0) {
      throw new Error(`Failed to read Go module: ${stderr}`)
    }
    return stdout.trim()
  }

  const readPackages = async () => {
    let stdout = ''
    let stderr = ''
    const result = await exec('go', ['list', './...'], {
      listeners: {
        stdout: (data) => {
          stdout += data.toString()
        },
        stderr: (data) => {
          stderr += data.toString()
        }
      }
    })
    if (result !== 0) {
      throw new Error(`Failed to read Go packages: ${stderr}`)
    }
    const packages = stdout
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
    return packages
  }

  return {
    module: await readModule(),
    packages: await readPackages()
  }
}
