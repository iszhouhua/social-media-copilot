import xhs from './xhs';
import dy from './dy';

const map = {
    dy,
    xhs
}

export default (platform?: typeof window.platform)=>{
    return map[platform || window.platform];
}