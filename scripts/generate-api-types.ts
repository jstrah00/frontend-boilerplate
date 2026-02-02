import fs from 'fs'
import path from 'path'
import openapiTS from 'openapi-typescript'

const API_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000'
const OPENAPI_URL = `${API_URL}/openapi.json`
const OUTPUT_PATH = path.join(process.cwd(), 'src', 'types', 'generated', 'api.ts')

async function generateTypes() {
  try {
    console.log(`Fetching OpenAPI schema from ${OPENAPI_URL}...`)

    const output = await openapiTS(OPENAPI_URL, {
      // Additional options can be added here
      exportType: true,
    })

    // Ensure the directory exists
    const dir = path.dirname(OUTPUT_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // Write the types to file
    fs.writeFileSync(OUTPUT_PATH, output)

    console.log(`✓ API types generated successfully at ${OUTPUT_PATH}`)
  } catch (error) {
    console.error('Error generating API types:', error)
    console.log('\nNote: Make sure the backend server is running at', API_URL)
    process.exit(1)
  }
}

generateTypes()
