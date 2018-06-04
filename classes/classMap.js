import Osc from './Osc';
import Filter from './Filter';
import ADSR from './ADSR';
import Gain from './Gain';
import Pan from './Pan';

const classMap = {
	'osc': Osc,
	'filter': Filter,
	'adsr': ADSR,
	'gain': Gain,
	'pan': Pan,
};

export default classMap;
