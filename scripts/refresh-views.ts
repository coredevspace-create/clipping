// Alternative au cron HTTP : `npm run cron:views` (à lancer toutes les heures sur un serveur).
import { refreshDueClips } from "../src/lib/tracking";

refreshDueClips()
  .then((r) => {
    console.log(JSON.stringify(r, null, 2));
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
