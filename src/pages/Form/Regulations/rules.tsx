import { Bot, Map, Hammer, Activity, Gamepad2, Code, Trophy, ExternalLink, Leaf } from 'lucide-react';

interface RulesProps {
    category: string;
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
        className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-[#673ab7] hover:shadow-md transition-all duration-200 group no-underline"
    >
        <div className="bg-white p-2 rounded-lg shadow-sm group-hover:bg-[#673ab7] transition-colors duration-200">
            <Icon className="w-6 h-6 text-[#673ab7] group-hover:text-white" />
        </div>
        <span className="font-semibold text-gray-700 group-hover:text-[#673ab7] text-sm flex-1">{title}</span>
        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#673ab7]" />
    </a>
);

const Rules: React.FC<RulesProps> = ({ category, onClose }) => {
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

    const renderGrid = (items: RuleLink[]) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {items.map((item, idx) => (
                <RuleCard key={idx} {...item} />
            ))}
        </div>
    );

    switch (category) {
        case 'Junior':
            rulesContent = (
                <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <p className="text-gray-700 text-sm">
                            Consulta el reglamento específico para la categoría <span className="font-bold text-[#673ab7]">Junior</span>:
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
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <p className="text-gray-700 text-sm">
                            Consulta el reglamento específico para la categoría <span className="font-bold text-[#673ab7]">Senior</span>:
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
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <p className="text-gray-700 text-sm">
                            Consulta el reglamento específico para la categoría <span className="font-bold text-[#673ab7]">Master</span>:
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
            rulesContent = <p className="text-gray-500 text-center py-8">Selecciona una categoría.</p>;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-0 relative flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Reglamentos</h2>
                        <p className="text-gray-500 text-sm mt-1">Normativa oficial CatoBots IV</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {rulesContent}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Rules;
