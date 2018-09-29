import Osc from './Osc';
import Drums from './Drums';
import Filter from './Filter';
import ADSR from './ADSR';
import Gain from './Gain';
import Pan from './Pan';
import Delay from './Delay';

const classMap = {
	'osc': Osc,
	'drums': Drums,
	'filter': Filter,
	'adsr': ADSR,
	'gain': Gain,
	'pan': Pan,
	'delay': Delay,
};

export default classMap;
