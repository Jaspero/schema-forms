export function safeEval(method: string | Function) {

  if (typeof method !== 'string') {
    return method;
  }

  let final: any;

  try {
    // tslint:disable-next-line:no-eval
    final = eval(method);
  } catch (e) {}

  return final;
}
