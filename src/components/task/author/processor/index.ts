import xhs from './xhs';
import dy from './dy';

export default (platform?: typeof window.platform) => {
    return { dy, xhs }[platform || window.platform];
}