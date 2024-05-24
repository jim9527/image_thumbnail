interface dataPoolType {
  [key: string]: {
    [filename: string]: {
      data: Buffer;
      timestamp: number;
    };
  };
}

const dataPool: dataPoolType = {};
const defaultTimeDuration: number = 1000 * 5

class TempMemory {
  pool: dataPoolType = dataPool;
  timer: any = null;
  limit: number = 5

  constructor(timeDuration: number) {
    this.initClear(timeDuration)
  }

  initClear(timeDuration: number): any {
    const currentTimestamp = new Date().valueOf();
    Object.keys(this.pool).forEach((ip) => {
      Object.keys(this.pool[ip]).forEach((filename) => {
        const fileObj = this.pool[ip][filename];
        if (fileObj.timestamp + 5 * 60 * 1000 < currentTimestamp) {
          delete this.pool[ip][filename];
        }
      });
    });

    return setTimeout(this.initClear.bind(this), timeDuration);
  }

  insert(key: string, filename: string, data: Buffer) {
    const timestamp = new Date().valueOf();
    if (this.pool[key]) {
      if (Object.keys(this.pool[key]).length > this.limit) {
        throw new Error('You have reached the limit of converting 5 images per IP. Please wait 5 minutes before trying again.')
      }

      this.pool[key][filename] = {
        data,
        timestamp: timestamp,
      };
    } else {
      this.pool[key] = {
        [filename]: {
          data,
          timestamp: timestamp,
        },
      };
    }
  }

  fetch(key: string, filename: string) {
    if (!key || !filename) return null
    
    return this.pool?.[key]?.[filename]
  }

  infos() {
    const dumpObj: any = {}
    Object.keys(this.pool).forEach(ip => {
        dumpObj[ip]= {}
        Object.keys(this.pool[ip]).forEach((filename) => {
            dumpObj[ip][filename] = { ...this.pool[ip][filename], data: '...' }
        })
    })
    return dumpObj
  }
}

export default new TempMemory(defaultTimeDuration)
