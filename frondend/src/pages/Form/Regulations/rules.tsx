import { Bot, Map, Hammer, Activity, Gamepad2, Code, Trophy, ExternalLink, Leaf } from 'lucide-react';

interface RulesProps {
    category: string;
    subCategory?: string;
    onClose: () => void;
}

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
        className="flex items-center gap-4 p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 hover:border-purple-600/50 hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-200 group no-underline"
    >
        <div className="bg-neutral-800 p-2 rounded-lg shadow-sm group-hover:bg-purple-600/20 transition-colors duration-200">
            <Icon className="w-6 h-6 text-purple-400 group-hover:text-purple-300" />
        </div>
        <span className="font-semibold text-neutral-300 group-hover:text-white text-sm flex-1">{title}</span>
        <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-purple-400" />
    </a>
);

const Rules: React.FC<RulesProps> = ({ category, subCategory, onClose }) => {
    let rulesContent;

    const urls = {
        robofut: "https://ucacueedu-my.sharepoint.com/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7BABC9DD7A-3FCE-409D-ABCA-E0D90576CBBA%7D&file=Reglas_Robofut.docx&action=default&mobileredirect=true&CT=1771016156656&OR=ItemsView",
        minisumo: "https://ucacueedu-my.sharepoint.com/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fnathalia%5Fperalta%5Fucacue%5Fedu%5Fec%2FDocuments%2F1%2E%20Unidad%20Academica%20de%20Informatica%2C%20ciencias%20de%20la%20computaci%C3%B3n%20e%20innovacion%20tecnologica%2FGestion%20de%20proyectos%2FCatoBots%2FIII%20Edicion%2FReglamentos&ga=1",
        laberinto: "https://ucacueedu-my.sharepoint.com/:w:/r/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7B8B8E0F68-2D21-4C00-979A-7195CBF59F2A%7D&file=ReglamentoLaberinto_v1.docx&action=default&mobileredirect=true",
        battlebots: "https://ucacueedu-my.sharepoint.com/:w:/r/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7B84E15B97-6EE4-4462-B0F5-CAD12491D94F%7D&file=BattleBots.docx&action=default&mobileredirect=true",
        seguidor: "https://ucacueedu-my.sharepoint.com/:w:/r/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7BCAE4B9A8-D383-41E6-9AB8-2DF7FCBE172C%7D&file=ReglamentoSeguidordeLinea.docx&action=default&mobileredirect=true",
        sumo_rc: "https://ucacueedu-my.sharepoint.com/:w:/r/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7BE504FB42-63DE-4F59-81F4-39B0B7B477DD%7D&file=ReglamentoSumoRC.docx&action=default&mobileredirect=true",
        scratch: "https://ucacueedu-my.sharepoint.com/:w:/r/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7B964F0D59-F202-4681-BFAD-FA11CCEDEC2C%7D&file=Scratch%20%26%20Play%20-%20Code%20Masters%20Arena.docx&action=default&mobileredirect=true"
    };

    const renderGrid = (items: RuleLink[]) => {
        const normalize = (s: string) => s.toLowerCase().replace(' ⚽', '').replace(' master', '');
        const filtered = subCategory 
            ? items.filter(i => 
                normalize(i.title).includes(normalize(subCategory)) || 
                normalize(subCategory).includes(normalize(i.title))
              )
            : items;
            
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {filtered.map((item, idx) => (
                    <RuleCard key={idx} {...item} />
                ))}
            </div>
        );
    };

    switch (category) {
        case 'Junior':
            rulesContent = (
                <div className="space-y-4">
                    <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                        <p className="text-neutral-300 text-sm">
                            Consulta el reglamento específico para la categoría <span className="font-bold text-purple-400">Junior</span>:
                        </p>
                    </div>
                    {renderGrid([
                        { title: "Robofut ⚽", icon: Trophy, url: urls.robofut },
                        { title: "Minisumo Autónomo", icon: Bot, url: urls.minisumo },
                        { title: "Laberinto", icon: Map, url: urls.laberinto },
                        { title: "BattleBots 1lb", icon: Hammer, url: urls.battlebots },
                        { title: "Seguidor de Línea", icon: Activity, url: urls.seguidor },
                        { title: "Sumo RC", icon: Gamepad2, url: urls.sumo_rc },
                        { title: "Scratch & Play", icon: Code, url: urls.scratch },
                    ])}
                </div>
            );
            break;
        case 'Senior':
            rulesContent = (
                <div className="space-y-4">
                    <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                        <p className="text-neutral-300 text-sm">
                            Consulta el reglamento específico para la categoría <span className="font-bold text-purple-400">Senior</span>:
                        </p>
                    </div>
                    {renderGrid([
                        { title: "Robofut", icon: Trophy, url: urls.robofut },
                        { title: "Minisumo Autónomo", icon: Bot, url: urls.minisumo },
                        { title: "Laberinto", icon: Map, url: urls.laberinto },
                        { title: "BattleBots 1lb", icon: Hammer, url: urls.battlebots },
                        { title: "Seguidor de Línea", icon: Activity, url: urls.seguidor },
                        { title: "Sumo RC", icon: Gamepad2, url: urls.sumo_rc },
                        { title: "Scratch & Play", icon: Code, url: urls.scratch },
                        { title: "BioBot", icon: Leaf, url: "#" }
                    ])}
                </div>
            );
            break;
        case 'Master':
            rulesContent = (
                <div className="space-y-4">
                    <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                        <p className="text-neutral-300 text-sm">
                            Consulta el reglamento específico para la categoría <span className="font-bold text-purple-400">Master</span>:
                        </p>
                    </div>
                    {renderGrid([
                        { title: "Minisumo Autónomo", icon: Bot, url: urls.minisumo },
                        { title: "Seguidor de Línea", icon: Activity, url: urls.seguidor },
                        { title: "Robofut ⚽", icon: Trophy, url: urls.robofut },
                        { title: "BattleBots 1lb", icon: Hammer, url: urls.battlebots },
                    ])}
                </div>
            );
            break;
        default:
            rulesContent = <p className="text-neutral-500 text-center py-8">Selecciona una categoría.</p>;
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl shadow-purple-900/20 w-full max-w-2xl p-0 relative flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Reglamentos</h2>
                        <p className="text-neutral-400 text-sm mt-1">Normativa oficial CatoBots IV</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar bg-neutral-900">
                    {rulesContent}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 rounded-b-2xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-neutral-800 border border-neutral-700 text-neutral-300 font-medium rounded-lg hover:bg-neutral-700 hover:text-white transition-colors shadow-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Rules;
