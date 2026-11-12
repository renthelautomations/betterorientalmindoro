// Navbar and mega menu text: "area.thing": ["English", "Filipino"]. Filipino drafts await native-speaker review.
export const MENU = {
  "nav.data": ["Data", "Datos"],
  "menu.data.proyekto.d": ["Public works by town, year and status", "Mga proyektong pampubliko ayon sa bayan, taon at katayuan"],
  "menu.data.estat.d": ["Population, area and finances of the 15 towns", "Populasyon, lawak at pananalapi ng 15 bayan"],
  "menu.data.badyet.d": ["The two districts' budget versions, compared", "Paghahambing ng mga bersyon ng badyet ng dalawang distrito"],
  "menu.data.dyn.d": ["Surnames that repeat in elections", "Mga apelyidong paulit-ulit sa halalan"],
  "menu.gov.opisyal.d": ["Officials, offices and how to reach them", "Mga opisyal, opisina at paano sila makontak"],
  "menu.gov.eo.d": ["Orders signed by the Governor, with summaries", "Mga order na pinirmahan ng Gobernador, may buod"],
  "menu.gov.bidding.d": ["Bids, awards and contracts, project by project", "Mga bidding, award at kontrata, bawat proyekto"],
  "menu.gov.ulat.d": ["Supplemental budgets and fund reports", "Mga supplemental budget at ulat ng pondo"],
  "menu.gov.trabaho.d": ["Open vacancies and their deadlines", "Mga bakanteng posisyon at deadline"],
  "menu.gov.mamuhunan.d": ["Where the province invites investors", "Saan inaanyayahan ng lalawigan ang mga mamumuhunan"],
  "menu.all.mht": ["About MaHalTaNa", "Tungkol sa MaHalTaNa"], "menu.all.svc": ["All services", "Lahat ng serbisyo"], "menu.all.gov": ["Open Government", "Buksan ang Pamahalaan"],
  "menu.all.redflags": ["Red flags in the 2027 budget", "Mga red flag sa badyet ng 2027"], "menu.label": ["Sections", "Mga seksyon"], "menu.open": ["Open menu", "Buksan ang menu"],
} as const satisfies Record<string, readonly [string, string]>;
