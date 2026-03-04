import { Bot, Map, Hammer, Activity, Gamepad2, Code, Trophy, ExternalLink, Leaf } from 'lucide-react';

interface RulesProps {
    category: string;
    subCategory?: string;
    onClose: () => void;
    categories: any[];
}

const iconMap: Record<string, React.ElementType> = {
    Bot, Map, Hammer, Activity, Gamepad2, Code, Trophy, Leaf
};

interface RuleLink {
    title: string;
    icon: React.ElementType;
    url: string;
}

const RuleCard: React.FC<RuleLink> = ({ title, icon: Icon, url }) => (
    <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 p-4 border-4 border-black bg-white hover:bg-[#10B961] shadow-[4px_4px_0px_#000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all duration-75 group no-underline"
    >
        <div className="bg-black p-2 text-[#FFF000]">
            <Icon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2.5} />
        </div>
        <span className="font-black text-black text-lg md:text-xl flex-1 uppercase tracking-tight group-hover:text-black font-['Montserrat',sans-serif]">{title}</span>
        <ExternalLink className="w-6 h-6 text-black group-hover:text-black" strokeWidth={3} />
    </a>
);

const Rules: React.FC<RulesProps> = ({ category, subCategory, onClose, categories }) => {
    // Filter categories for the current level
    const levelCategories = categories.filter((c: any) => c.levels?.includes(category));

    // Build rule links from the dynamic categories
    const ruleLinks: RuleLink[] = levelCategories
        .filter((c: any) => c.rulesUrl)
        .map((c: any) => ({
            title: c.name,
            icon: iconMap[c.icon] || Gamepad2,
            url: c.rulesUrl,
        }));

    // Filter by subCategory if one is selected
    const normalize = (s: string) => s.toLowerCase();
    const filteredRules = subCategory
        ? ruleLinks.filter(r =>
            normalize(r.title).includes(normalize(subCategory)) ||
            normalize(subCategory).includes(normalize(r.title))
          )
        : ruleLinks;

    const CategoryBadge = ({ categoryText }: { categoryText: string }) => (
        <div className="bg-black border-l-8 border-[#FFF000] p-4 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
            <div className="absolute top-0 right-0 bottom-0 w-16 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #FFF000 0, #FFF000 10px, transparent 10px, transparent 20px)' }}></div>
            <p className="text-white text-base md:text-lg font-black uppercase tracking-widest relative z-10 font-['Montserrat',sans-serif]">
                NORMATIVA ESPECÍFICA <br className="md:hidden" /><span className="text-[#10B961] md:ml-2">/ CATEGORÍA {categoryText}</span>
            </p>
        </div>
    );

    let rulesContent;

    if (filteredRules.length > 0 || ruleLinks.length > 0) {
        const displayRules = filteredRules.length > 0 ? filteredRules : ruleLinks;
        rulesContent = (
            <div className="space-y-4">
                <CategoryBadge categoryText={category.toUpperCase()} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {displayRules.map((item, idx) => (
                        <RuleCard key={idx} {...item} />
                    ))}
                </div>
            </div>
        );
    } else {
        rulesContent = (
            <div className="py-12 bg-black border-4 border-[#FFF000] text-center shadow-[6px_6px_0px_#000] relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #10B961 0, #10B961 10px, transparent 10px, transparent 20px)' }}></div>
                <p className="text-[#FFF000] text-2xl font-black uppercase tracking-widest relative z-10 drop-shadow-[2px_2px_0px_#10B961]">
                    SELECCIONA UNA CATEGORÍA
                </p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-[#111111] border-4 border-black shadow-[8px_8px_0px_#10B961] w-full max-w-4xl p-0 relative flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b-4 border-black flex items-center justify-between bg-[#10B961] relative z-10 overflow-hidden">
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #000 0, #000 2px, transparent 2px, transparent 10px)' }}></div>
                    <div className="relative z-10 flex gap-4 items-center">
                        <div className="bg-black text-[#FFF000] p-3 hidden md:block">
                            <Bot className="w-8 h-8" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black text-[#FFF000] italic uppercase drop-shadow-[3px_3px_0px_#000]">REGLAMENTOS</h2>
                            <p className="text-black font-black text-sm md:text-base mt-0 uppercase tracking-[0.2em]">Normativa oficial CatoBots IV</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="relative z-10 p-2 border-4 border-black bg-[#FFF000] shadow-[4px_4px_0px_#000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all duration-75 text-black font-black h-12 w-12 flex items-center justify-center text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar bg-[#111111] relative">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
                    <div className="relative z-10">
                        {rulesContent}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t-4 border-black bg-[#10B961] flex justify-end relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)' }}></div>
                    <button
                        onClick={onClose}
                        className="relative z-10 px-8 py-3 bg-black border-4 border-black text-[#FFF000] font-black uppercase text-lg shadow-[4px_4px_0px_#FFF000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all duration-75"
                    >
                        CERRAR VENTANA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Rules;
