export function handlePromise(
  promise: Promise<any>,
  errMessage?: string
): Promise<any> {
  return promise
    .then((resp) => {
      console.log('handlePromise success');
      if (!resp.ok) {
      }

      return [null, resp];
    })
    .catch((err) => {
      console.log('handlePromise error');
      const errPayload = errMessage ? errMessage : err;
      return [errPayload, null];
    });
}

export async function handleFetchResponse(res: Response): Promise<any> {
  const payload = await res.json();
  if (res.ok) {
    return payload;
  }
  // NOTE: we usually throw a Error instance but in our
  // particular use case, we need to expose the actual error
  // so as a workaround, we just return a "error object literal"
  // containing properties from the actual error returned by the server
  throw { ...payload };
}
