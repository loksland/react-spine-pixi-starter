export function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  callback: F,
  delay: number,
  fireImmediately = true,
) {
  let timer: NodeJS.Timeout;
  let callNumber = -1;
  return function (...args: Parameters<F>) {
    callNumber++;
    if (delay <= 0 || (fireImmediately && callNumber === 0)) {
      callback(...args);
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}
