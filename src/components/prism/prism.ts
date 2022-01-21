import { Prism } from 'prism-react-renderer';
(typeof global !== 'undefined' ? global : window).Prism = Prism;

import 'prismjs/components/prism-solidity';

import './syntaxes/rust';

export default Prism;
