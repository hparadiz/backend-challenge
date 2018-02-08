## 

## Response to [P'unk Avenue Node.js Backend Challenge](https://github.com/punkave/backend-challenge)

# Usage
1. Get npm and nodejs & mongodb
2. Git clone the project from this Github page
3. Make a copy of `conf/sample` -> `conf/production`. Fill it in. Configure mongodb.
4. From terminal cd into the git repo and run `npm link`
5. Run `punkave start` from terminal
6. Observe running instance with `tail -f log/backend-challenge.log`

# Server CLI
```
backend-challenge$ punkave
Usage: punkave [status|start|reload|stop]
```