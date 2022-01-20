import Prism from 'prism-react-renderer/prism';

(typeof global !== 'undefined' ? global : window).Prism = Prism;

import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-haskell';
import 'prismjs/components/prism-go';

export default Prism;
export { StyledPre } from './style';
