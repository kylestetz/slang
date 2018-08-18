import Osc from './Osc';
import Filter from './Filter';
import ADSR from './ADSR';
import Gain from './Gain';
import Pan from './Pan';
import Delay from './Delay';

const classMap = {
	'osc': Osc,
	'filter': Filter,
	'adsr': ADSR,
	'gain': Gain,
	'pan': Pan,
	'delay': Delay,
};

export default classMap;
