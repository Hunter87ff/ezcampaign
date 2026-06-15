import React from 'react';

interface TopCampaignsListProps {
  topCampaigns: { name: string; cr: string; sent: number }[];
}

export const TopCampaignsList: React.FC<TopCampaignsListProps> = ({ topCampaigns }) => {
  // Map progress bar widths based on conversion rate
  const getWidthClass = (cr: string) => {
    switch (cr) {
      case '24%':
        return 'w-[85%]';
      case '18%':
        return 'w-[60%]';
      case '12%':
        return 'w-[45%]';
      default:
        return 'w-[30%]';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full select-none text-left">
      {/* Header Block */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 select-none">
        <h4 className="font-sans font-bold text-sm text-slate-800 dark:text-slate-200">
          Top Campaigns
        </h4>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          Conversion rate performance rankings
        </p>
      </div>

      {/* Campaigns list and online agents */}
      <div className="p-5 space-y-5 flex-1 flex flex-col justify-between">
        
        {/* Campaigns tracker */}
        <div className="space-y-4">
          {topCampaigns.map((camp) => (
            <div key={camp.name} className="space-y-1.5 text-left">
              <div className="flex justify-between items-center text-xs font-sans font-semibold">
                <span className="text-slate-700 dark:text-slate-350">{camp.name}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{camp.cr} CR</span>
              </div>
              
              {/* Outer progress track */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200/20">
                <div
                  className={`bg-gradient-to-r from-primary/80 to-primary dark:from-emerald-600 dark:to-emerald-400 h-full rounded-full ${getWidthClass(
                    camp.cr
                  )}`}
                />
              </div>
              
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                {camp.sent} Messages dispatched
              </p>
            </div>
          ))}
        </div>

        {/* Separator and Agents list */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
          <p className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            Agents Online
          </p>
          
          <div className="flex items-center gap-2">
            {/* Avatars overlaps */}
            <div className="flex -space-x-2.5">
              <img
                className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-2xs"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkfkIzKpgRhwj6A8UzZWUVivvmbEAxHLshbV2BrKyzJCkTbhxPrgCf9r0UFkvfot8DkhnuqVRu2lxb2VU2R1oyKtUdiaGbf0Vnctoqp2zjoawZPbhj35a3LR2skZtk_YQBUE4UVM1JtuTtxFm1truGCYl2JcUyynUUCGBtU78QenOCHF84yRY7W8iaFEYJzgL1toPhl_HCew_mI4Yf4-Clpn4WIX7ADefX-xmutHMyihst_Mt-aWLzZZsAcLqMF1HlZLN7IFQJfSQ"
                alt="Agent portrait"
              />
              <img
                className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-2xs"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKBCTOZJhxGeppRuqANtu7EHmcmPiXwPvwjkjNG2Zwc35h1qSU4CfL1s6eamw6Nl7ekQrF40U4L2LO_3WVjiRu7edRER203fFslYxpn_jEYUqO8KuXD2zPl0kEPZpu_Jh0U7GfDv-bniXzG2MaBt8WLzIruIZ89kE9NNQFqec-mZJqZ6VKbkioct_b825V_43G5ZuviSjAjMiNMpvp6Cli2F8M1P7FW3Kpjn1AINNklsj9va5By_hzIGLHKbTOyUcNgKdoSZ1b3Wg"
                alt="Agent portrait"
              />
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-sans font-bold text-slate-500 dark:text-slate-400 shadow-2xs">
                +6
              </div>
            </div>
            
            {/* Active text with indicator dot */}
            <div className="flex items-center gap-1.5 ml-1 select-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold font-sans">
                Active now
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default TopCampaignsList;
