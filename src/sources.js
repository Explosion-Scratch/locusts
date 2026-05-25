/**
 * @typedef {Object} Quote
 * @property {string} text
 * @property {string} [page]
 * @property {string} [context]
 */

/**
 * @typedef {Object} Source
 * @property {string} key
 * @property {string} type
 * @property {string} citation
 * @property {string} [short]
 * @property {string} [url]
 * @property {string} [author]
 * @property {string} [year]
 * @property {Quote[]} [quotes]
 */

/** @type {Record<string, Source>} */
export const SOURCES = {
  lockwood: {
    key: "lockwood",
    type: "book",
    author: "Jeffrey A. Lockwood",
    year: "2004",
    citation:
      'Lockwood, J. A. (2004). <em>Locust: The Devastating Rise and Mysterious Disappearance of the Insect that Shaped the American Frontier</em>. Basic Books.',
    short: "Lockwood, <em>Locust</em>.",
    quotes: [
      {
        text: "Within the [Permanent] Region, spretus did not breed everywhere, but instead it did so in favorable places. River bottoms, sunny slopes of uplands, and subalpine grassy areas among the mountains were considered to be favored egg-laying sites.",
        context: "Describing Riley's maps of the Rocky Mountain Locust's permanent breeding zone",
      },
      {
        text: "When irrigation is practicable, as it is in some of the ravaged parts of Colorado, let the ground be thoroughly inundated for a few days, and the eggs will lose vitality and rot.",
        context: "Charles Valentine Riley's recommendation for egg destruction",
      },
      {
        text: "Riegert advocated precisely the opposite consequence. He suggested that the changes in the landscape following the extirpation of bison were detrimental, over the long term, for the locust.",
        context: "Paul Riegert's bison-locust hypothesis",
      },
      {
        text: "The females avoided very loose soil and moist ground. Like insectan Goldilocks in search of \"just right\" conditions, the locusts buried their eggs in the well-drained soils of the montane valleys. The egg beds lay between the overly wet, silty streamsides and the sere, rocky hillsides. During their plundering of the prairie farms, the locusts laid their eggs in soils that mimicked the fertile river valleys of the Rockies.",
        context: "Disproving Riegert's theory about locust egg-laying preferences",
      },
      {
        text: 'Our best guess is that there were 30 to 60 million bison in North America, prior to European settlement. Estimating the peak number of Rocky Mountain locusts is an equally dicey affair. But let\'s take the outbreak of the 1870s and presume that half of the reportedly infested area actually had locusts present at any given time. If so, then these insects were present across an area of 500,000 square miles (about twice the area of Texas). The carrying capacity of rangeland for modern-day grasshoppers is around 10 individuals per square yard. Using this figure—which is probably quite conservative, as we\'re considering the locust during an outbreak—we\'d end up with 15 trillion insects, or a couple thousand locusts for every person currently on the earth.',
        context: "Comparing bison and locust population estimates",
      },
      {
        text: "They do not refuse even dead animals, but have been seen feasting on dead bats and birds.",
        context: "Describing the omnivorous appetite of locusts",
      },
      {
        text: "Governor John L. Pennington proclaimed May 4 as his own territory's day of fasting, humiliation, and prayer.",
        context: "Governmental and religious response to the locust plagues",
      },
    ],
  },

  casto: {
    key: "casto",
    type: "journal",
    author: "Stanley D. Casto",
    year: "2007",
    citation:
      'Casto, S. D. (2007). The Rocky Mountain Locust in Texas. <em>The Southwestern Historical Quarterly</em>, 111(2), 182–204.',
    short: "Casto, “The Rocky Mountain Locust in Texas.”",
    url: "https://www.jstor.org/stable/30239563",
    quotes: [
      {
        text: "Scientific expertise and governmental assistance were nonexistent.",
        page: "184",
        context: "On the lack of institutional response to early locust invasions",
      },
    ],
  },

  jstor_daily: {
    key: "jstor_daily",
    type: "article",
    author: "JSTOR Daily",
    year: "2017",
    citation:
      'JSTOR Daily. (2017). The Long-Lost Locust. <em>JSTOR Daily</em>.',
    short: "JSTOR Daily, “The Long-Lost Locust.”",
    url: "https://daily.jstor.org/the-long-lost-locust/",
  },

  nebraska_history: {
    key: "nebraska_history",
    type: "journal",
    author: "Nebraska State Historical Society",
    year: "2008",
    citation:
      'Nebraska State Historical Society. (2008). Grasshoppered: When Plagues of Locusts Swept Across Nebraska. <em>Nebraska History</em>.',
    short: "Nebraska State Historical Society, “Grasshoppered.”",
    url: "https://history.nebraska.gov/wp-content/uploads/2017/11/doc_publications_NH2008Grasshoppered.pdf",
    quotes: [
      {
        text: "Attracted to the salt from perspiration, the oversized insects chewed on the wooden handles of rakes, hoes, and pitchforks, and on the leather of saddles and harness.",
        context: "Describing locust consumption of non-plant materials",
      },
      {
        text: "Governor Robert W. Furnas in January 1875 recommended and the state legislature authorized issuing $50,000 in state bonds to purchase seed for grasshopper victims.",
        context: "Nebraska seed relief bonds",
      },
    ],
  },

  nebraska_outdoor: {
    key: "nebraska_outdoor",
    type: "article",
    author: "Nebraskaland Magazine",
    year: "1874",
    citation:
      'Nebraskaland Magazine. Clouds of Grasshoppers in 1874. <em>Nebraska Game and Parks Commission</em>.',
    short: "Nebraskaland Magazine, “Clouds of Grasshoppers in 1874.”",
    url: "https://digital.outdoornebraska.gov/nebraskaland-magazine/clouds-of-grasshoppers-in-1874",
  },

  nebraska_article: {
    key: "nebraska_article",
    type: "journal",
    citation:
      'Kepfield, S. S. Grasshoppers and public assistance in Nebraska. <em>Great Plains Quarterly</em>.',
    short: "Kepfield, “Grasshoppers and public assistance.”",
    url: "https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1117&context=greatplainsquarterly",
  },

  lisa_rogers: {
    key: "lisa_rogers",
    type: "article",
    author: "Lisa Waller Rogers",
    citation:
      'Rogers, L. W. Frontier Tales. <em>lisawallerrogers.com</em>.',
    short: "Rogers, “Frontier Tales.”",
    url: "https://lisawallerrogers.com/category/topics/frontier-tales/",
    quotes: [
      {
        text: "The storm of grasshoppers came one Sunday. I remember that I was wearing a dress of white with a green stripe. The grasshoppers settled on me and ate up every bit of green stripe in that dress before anything could be done about it.",
        context: "Pioneer account of locusts eating clothing dye",
      },
    ],
  },

  eskimo_curlew: {
    key: "eskimo_curlew",
    type: "article",
    author: "U.S. Fish & Wildlife Service",
    citation:
      'U.S. Fish & Wildlife Service. Whither Went the Eskimo Curlew? <em>fws.gov</em>.',
    url: "https://www.fws.gov/story/whither-went-eskimo-curlew",
  },

  missoula_butterfly: {
    key: "missoula_butterfly",
    type: "article",
    author: "Missoula Butterfly House & Insectarium",
    citation:
      'Missoula Butterfly House & Insectarium. Notes from the Lab: The Rocky Mountain Locust.',
    short: "Missoula Butterfly House, “The Rocky Mountain Locust.”",
    url: "https://www.missoulabutterflyhouse.org/notes-from-the-lab-the-rocky-mountain-locust/",
    quotes: [
      {
        text: 'Locust bounties by the bushelful were commonplace, with Nebraska even instituting the "Grasshopper Act," stating that every able-bodied person between the ages of 16 and 60 was required to devote two full days to destroying locust nymphs during the spring hatch or face a $10 fine.',
        context: "Nebraska's 1877 Grasshopper Act",
      },
    ],
  },

  battlefields: {
    key: "battlefields",
    type: "primary_source",
    author: "American Battlefield Trust",
    citation:
      "American Battlefield Trust. Primary Sources: 1874 Grasshopper Invasion.",
    short: "American Battlefield Trust, “1874 Grasshopper Invasion.”",
    url: "https://www.battlefields.org/learn/primary-sources/1874-grasshopper-invasion",
  },

  national_guard: {
    key: "national_guard",
    type: "article",
    author: "National Guard Bureau",
    year: "2013",
    citation:
      "National Guard Bureau. (2013). In 1937, Colorado Guard Used Flamethrowers and Explosives Against Plague of Locusts. <em>National Guard</em>.",
    url: "https://www.nationalguard.mil/News/Article-View/Article/575751/in-1937-colorado-guard-used-flamethrowers-and-explosives-against-plague-of-locu/",
  },

  pfluger_braunig: {
    key: "pfluger_braunig",
    type: "journal",
    author: "Hans-Joachim Pflüger & Peter Bräunig",
    year: "2021",
    citation:
      'Pflüger, H.-J. & Bräunig, P. (2021). One hundred years of phase polymorphism research in locusts. <em>J Comp Physiol A</em>, 207(3), 321–326.',
    short: "Pflüger & Bräunig, “One hundred years.”",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8079285/",
  },

  anstey_serotonin: {
    key: "anstey_serotonin",
    type: "journal",
    author: "Michael L. Anstey et al.",
    year: "2009",
    citation:
      'Anstey, M. L., Rogers, S. M., Ott, S. R., Burrows, M. & Simpson, S. J. (2009). Serotonin mediates behavioral gregarization underlying swarm formation in desert locusts. <em>Science</em>, 323, 627–630.',
    short: "Anstey et al., “Serotonin mediates behavioral gregarization.”",
    url: "https://pubmed.ncbi.nlm.nih.gov/19179529/",
  },

  mcgill_bioengineering: {
    key: "mcgill_bioengineering",
    type: "article",
    author: "McGill University Bioengineering",
    citation:
      "McGill University. Unlocking Locust Survival: A Chemical Analysis of Locusts. <em>Bioengineering Hyperbook</em>.",
    url: "https://bioengineering.hyperbook.mcgill.ca/unlocking-locust-survival-a-chemical-analysis-of-locusts/",
  },

  hopperwiki_lifecycle: {
    key: "hopperwiki_lifecycle",
    type: "wiki",
    citation:
      'Life cycle of a locust. <em>Hopper Wiki</em>.',
    url: "https://hopperwiki.org/index.php/Life_cycle_of_a_locust",
  },

  hopperwiki_highplains: {
    key: "hopperwiki_highplains",
    type: "wiki",
    citation:
      'High Plains grasshopper (<em>Dissosteira longipennis</em>). <em>Hopper Wiki</em>. Primarily compiled from Wakeland, C. (1958). <em>The High Plains Grasshopper</em>. USDA.',
    short: "Hopper Wiki, High Plains grasshopper.",
    url: "https://hopperwiki.org/index.php/High_Plains_grasshopper_(Dissosteira_longipennis)",
    quotes: [
      {
        text: "It is best known for its 1934-1940 catastrophic outbreak where almost 24 million acres across five states were affected. There has not been an outbreak of this species since.",
        context: "Hopper Wiki summary of the Dust Bowl–era plague",
      },
      {
        text: "No other insect-control effort in the western United States matched the scale, scope, and level of cooperation achieved in the campaign against the High Plains grasshopper from 1937 to 1940. Poison baiting was the primary means of control during this time.",
        context: "Federal and state eradication efforts",
      },
      {
        text: "In 1937, 2,940 adults were marked with paint, and 16 were recovered 1 to 13 days later, 17 to 175 miles away, mainly northwest, moving 10 to 37 miles per day with prevailing winds.",
        context: "Mark-and-recapture migration study during the outbreak",
      },
      {
        text: "By 1940, baiting combined with natural factors—such as birds, weather, predators, and parasites—finally brought the outbreak under control.",
        context: "End of the 1934–1940 outbreak",
      },
      {
        text: "Overall, control efforts during this period cost 2.25 million dollars (over 50 million in 2025).",
        context: "Total expenditure on outbreak control, Wakeland (1958)",
      },
    ],
  },

  migratory_grasshopper: {
    key: "migratory_grasshopper",
    type: "web",
    citation:
      'Migratory grasshopper (<em>Melanoplus sanguinipes</em>). USDA Agricultural Research Service.',
    short: "USDA ARS, migratory grasshopper fact sheet.",
    url: "https://web.archive.org/web/20020505172744/http://www.sidney.ars.usda.gov/grasshopper/ID_Tools/F_Sheets/migrator.htm",
  },

  differential_grasshopper: {
    key: "differential_grasshopper",
    type: "web",
    citation:
      'Differential grasshopper (<em>Melanoplus differentialis</em>). <em>BugGuide</em>.',
    short: "BugGuide, differential grasshopper.",
    url: "https://bugguide.net/node/view/3965",
  },

  albert_swarm: {
    key: "albert_swarm",
    type: "encyclopedia",
    citation:
      "Albert's swarm. (2026). In <em>Wikipedia</em>.",
    short: "“Albert's swarm.”",
    url: "https://en.wikipedia.org/wiki/Albert%27s_swarm",
  },

  miracle_gulls: {
    key: "miracle_gulls",
    type: "encyclopedia",
    citation:
      "Miracle of the gulls. (2026). In <em>Wikipedia</em>.",
    url: "https://en.wikipedia.org/wiki/Miracle_of_the_gulls",
  },

  mary_lyon: {
    key: "mary_lyon",
    type: "primary_source",
    citation:
      "Lyon, M. Pioneer account of the Swarm of 1874, Kansas.",
  },

  uvarov: {
    key: "uvarov",
    type: "journal",
    author: "Boris Uvarov",
    year: "1921",
    citation:
      'Uvarov, B. P. (1921). A Revision of the Genus Locusta, L. (= Pachytylus, Fieb.), with a New Theory as to the Periodicity and Migrations of Locusts. <em>Bulletin of Entomological Research</em>, 12(2), 135–163.',
    short: "Uvarov, “A Revision of the Genus Locusta.”",
    quotes: [
      {
        text: "After the 1880s, however, these breeding grounds had not generated another outbreak. This is easily explained by the fact that the valleys of the Don, Kuban and Dnieper were during the end of the last century more or less cultivated or, at any rate, their natural conditions were entirely changed by the persistent grazing of herds of cattle.",
        context: "Attributing locust decline to agricultural transformation of breeding grounds",
      },
    ],
  },

  ingalls_wilder: {
    key: "ingalls_wilder",
    type: "book",
    author: "Laura Ingalls Wilder",
    year: "1937",
    citation:
      'Ingalls Wilder, L. (1937). <em>On the Banks of Plum Creek</em>. Harper & Brothers.',
  },

  fao_locust: {
    key: "fao_locust",
    type: "web",
    citation:
      "FAO Desert Locust Information Service. (2026). <em>Food and Agriculture Organization of the United Nations</em>.",
    url: "https://www.fao.org/ag/locusts/en/",
  },

  simpson_sword: {
    key: "simpson_sword",
    type: "journal",
    author: "Stephen J. Simpson & Gregory A. Sword",
    year: "2008",
    citation:
      'Simpson, S. J. & Sword, G. A. (2008). Locusts. <em>Current Biology</em>, 18(9), R364–R366.',
  },

  bazazi_cannibalism: {
    key: "bazazi_cannibalism",
    type: "journal",
    author: "Bazazi, S. et al.",
    year: "2008",
    citation:
      'Bazazi, S. et al. (2008). Collective motion and cannibalism in locust migratory bands. <em>Current Biology</em>, 18(10), 735–739.',
  },

  riley_commission: {
    key: "riley_commission",
    type: "government",
    author: "Charles V. Riley, Alpheus S. Packard & Cyrus Thomas",
    year: "1878",
    citation:
      'Riley, C. V., Packard, A. S. & Thomas, C. (1878). <em>First Annual Report of the United States Entomological Commission for the Year 1877 Relating to the Rocky Mountain Locust</em>. Government Printing Office.',
    short: "Riley, Packard & Thomas, <em>First Annual Report</em>.",
    url: "https://www.biodiversitylibrary.org/item/107269",
  },

  hcn_super_hopper: {
    key: "hcn_super_hopper",
    type: "article",
    author: "High Country News",
    citation:
      "High Country News. The Death of the Super Hopper.",
    short: "High Country News, “The Death of the Super Hopper.”",
    url: "https://www.hcn.org/issues/issue-243/the-death-of-the-super-hopper/",
  },

  rileys_map: {
    key: "rileys_map",
    type: "image",
    citation:
      'Riley, C. V., Packard, A. S. & Thomas, C. (1877). Plate II: The locust plague in the United States. <em>Wikimedia Commons</em>.',
    short: "Riley et al., “Plate II.”",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/73/Plate_II_The_locust_plague_in_the_United_States_%281877%29.jpg",
  },

  animal_diversity: {
    key: "animal_diversity",
    type: "web",
    citation:
      'University of Michigan Museum of Zoology. <em>Melanoplus spretus</em>. Animal Diversity Web.',
    short: "Animal Diversity Web, <em>Melanoplus spretus</em>.",
    url: "https://animaldiversity.org/accounts/Melanoplus_spretus/",
  },

  today_history: {
    key: "today_history",
    type: "article",
    citation:
      "Today in History. October 20, 1937: Albert's Swarm.",
    short: "Today in History, “Albert's Swarm.”",
    url: "https://todayinhistory.blog/2018/10/20/october-20-1937-alberts-swarm/",
  },

  hopperwiki_lifecycle_diagram: {
    key: "hopperwiki_lifecycle_diagram",
    type: "image",
    citation:
      "HopperWiki. Australian plague locust life cycle diagram.",
    short: "HopperWiki, life cycle diagram.",
    url: "https://hopperwiki.org/images/c/c4/Australian_plague_locust_life_cycle_diagram.jpg",
  },

  flint: {
    key: "flint",
    type: "book",
    author: "Mary Louise Flint",
    year: "1998",
    citation:
      'Flint, M. L. (1998). <em>Pests of the Garden and Small Farm</em> (2nd ed.). University of California Agriculture and Natural Resources.',
    short: "Flint, <em>Pests of the Garden and Small Farm</em>.",
  },

  science_marching: {
    key: "science_marching",
    type: "journal",
    citation:
      'Buhl, J. et al. (2006). From disorder to order in marching locusts. <em>Science</em>, 312(5778), 1402–1406.',
    short: "Buhl et al., “From disorder to order.”",
    url: "https://www.science.org/doi/10.1126/science.1125142",
  },
};

/**
 * @param {string} key
 * @returns {Source}
 */
export function getSource(key) {
  const source = SOURCES[key];
  if (!source) {
    throw new Error(`Unknown source key: "${key}". Available keys: ${Object.keys(SOURCES).join(", ")}`);
  }
  return source;
}

/**
 * @param {string} key
 * @param {number} [quoteIndex=0]
 * @returns {Quote}
 */
export function getQuote(key, quoteIndex = 0) {
  const source = getSource(key);
  if (!source.quotes || !source.quotes[quoteIndex]) {
    throw new Error(`No quote at index ${quoteIndex} for source "${key}"`);
  }
  return source.quotes[quoteIndex];
}

/**
 * @param {...string} keys
 * @returns {Source[]}
 */
export function getSources(...keys) {
  return keys.map(getSource);
}

function sourceLink(source, label = "Source") {
  return source.url
    ? ` <a class="citation-source-link" href="${source.url}" target="_blank" rel="noopener">${label}</a>`
    : "";
}

function getCitationQuote(source, quoteIndex, inlineQuote) {
  const quote = inlineQuote || source.quotes?.[quoteIndex]?.text;
  if (!quote) return "";
  const context = source.quotes?.[quoteIndex]?.context;
  return { quote, context };
}

function quoteHtml(source, quoteIndex, inlineQuote, className = "citation-list__quote") {
  const result = getCitationQuote(source, quoteIndex, inlineQuote);
  if (!result) return "";
  return `<span class="${className}">“${result.quote}”</span>`;
}

export function formatCitation(key, occurrence = 1, quoteIndex = null, inlineQuote = "") {
  const source = getSource(key);
  const base = occurrence > 1 && source.short ? source.short : source.citation;
  const quote = quoteHtml(source, quoteIndex, inlineQuote);
  return quote ? `${base}${quote}${sourceLink(source)}` : `${base}${sourceLink(source)}`;
}

export function formatCitationPreview(key, occurrence = 1, quoteIndex = null, inlineQuote = "") {
  const source = getSource(key);
  const base = occurrence > 1 && source.short ? source.short : source.citation;
  const quote = quoteHtml(source, quoteIndex, inlineQuote, "citation-tooltip__quote");
  return quote ? `${base}${quote}${sourceLink(source)}` : `${base}${sourceLink(source)}`;
}
