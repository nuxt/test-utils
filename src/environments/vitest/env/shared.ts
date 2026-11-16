export function createCompatRequest(
  {
    window,
    toRequestBlobBytes,
    toRequestedFormData,
  }: {
    window: typeof globalThis
    toRequestBlobBytes: (blob: Blob | File) => Uint8Array<ArrayBuffer>
    toRequestedFormData?: (request: Request) => Promise<FormData>
  },
) {
  const {
    Blob: NodeBlob,
    File: NodeFile,
    FormData: NodeFormData,
    Request: NativeRequest,
  } = globalThis

  const toNodeBlobLike = (blob: Blob | File) => {
    const bytes = toRequestBlobBytes(blob)
    if (blob instanceof window.File) {
      const { name: filename, type, lastModified } = blob
      return new NodeFile([bytes], filename, { type, lastModified })
    }
    return new NodeBlob([bytes], { type: blob.type })
  }

  const toNodePayload = (init?: RequestInit) => {
    if (init?.body) {
      if (init.body instanceof window.FormData) {
        const form = new NodeFormData()
        init.body.forEach((val, key) => {
          form.append(key, val instanceof window.Blob ? toNodeBlobLike(val) : val)
        })
        return { ...init, body: form }
      }
      else if (init.body instanceof window.Blob) {
        return { ...init, body: toNodeBlobLike(init.body) }
      }
    }
    return init
  }

  return class Request extends NativeRequest {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      if (typeof input === 'string') {
        super(new URL(input, window.location.href), toNodePayload(init))
      }
      else {
        super(input, toNodePayload(init))
      }
    }

    override async formData() {
      if (toRequestedFormData) {
        return toRequestedFormData(this)
      }
      return super.formData()
    }

    static override [Symbol.hasInstance](value: unknown): boolean {
      return value instanceof NativeRequest
    }
  }
}
