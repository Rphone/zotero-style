import { config } from "../../package.json";

class LocalStorage {
  private filename!: string;
  private cache: any;
  public lock: _ZoteroPromiseObject;
  constructor(filename: string) {
    this.lock = Zotero.Promise.defer()
    this.init(filename)
  }

  async init(filename: string) {
    const window = Zotero.getMainWindow();
    // @ts-ignore
    const OS = window.OS;
    if (!(await OS.File.exists(filename))) {
      const temp = Zotero.getTempDirectory();
      this.filename = OS.Path.join(temp.path.replace(temp.leafName, ""), `${filename}.json`);
    } else {
      this.filename = filename
    }
    try {
      const rawString = await Zotero.File.getContentsAsync(this.filename) as string
      this.cache = JSON.parse(rawString)
      ztoolkit.log(this.cache)
    } catch {
      this.cache = {}
    }
    this.lock.resolve()
  }

  get(item: Zotero.Item, key: string) {
    if (this.cache == undefined) { return }
    return (this.cache[item.id] ??= {})[key]
  }

  async set(item: Zotero.Item, key: string, value: any) {
    await this.lock.promise;
    (this.cache[item.id] ??= {})[key] = value
    window.setTimeout(async () => {
      await Zotero.File.putContentsAsync(this.filename, JSON.stringify(this.cache));
    })
  }
}

export default LocalStorage

