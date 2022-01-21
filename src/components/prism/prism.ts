import { Prism } from 'prism-react-renderer';
(typeof global !== 'undefined' ? global : window).Prism = Prism;

import 'prismjs/components/prism-haskell';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-solidity';

import rustSyntax from './lang/rust';
Prism.languages['rust'] = rustSyntax;

export default Prism;
