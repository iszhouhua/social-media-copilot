import { XhsProcessor } from './xhs';
import { DyProcessor } from './dy';

export default {
    dy: new DyProcessor(),
    xhs: new XhsProcessor()
}