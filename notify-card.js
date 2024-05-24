class NotifyCard extends HTMLElement {
  setConfig(config) {
    if (!config.target) {
      throw new Error('You need to define one or more targets');
    }
    this.config = config;
    if (typeof this.config.target == "string") {
      this.targets = [this.config.target];
    } else if (Array.isArray(this.config.target)) {
      this.targets = this.config.target
    } else {
      throw new Error('Target needs to be a list or single target');
    }
    this.render();
  }

  render() {
    if (!this.content) {
      this.card = document.createElement('ha-card');
      this.content = document.createElement('div');
      this.content.style.padding = '0 16px 16px';
      this.card.appendChild(this.content);
      this.appendChild(this.card);
    }
    this.card.header = this.config.title || "Send Notification";
    let label = this.config.label || "Mensaje"
    this.content.innerHTML = `
      <div style="display: flex">
        <input type="checkbox" id="miCheck">TTS</br>
        <div style="display: flex; align-items: center; flex-grow: 1;">
          <ha-textfield style="flex-grow: 1;" label="${label}"></ha-textfield>
          <ha-icon-button icon="hass:send" style="margin-left: 8px;">
            <ha-icon icon="hass:send"></ha-icon>
          </ha-icon-button>
        </div>
      </div>
    `;
    this.content.querySelector("ha-icon-button").addEventListener("click", this.send.bind(this), false);
    this.content.querySelector("ha-textfield").addEventListener("keydown", this.keydown.bind(this), false);
  }

  send(){
    let tts = this.content.querySelector('input[type=checkbox]'); 
    let msg = this.content.querySelector("ha-textfield").value;
    for (let t of this.targets) {
      let [domain, target = null] = t.split(".");
      if(target === null){
        target = domain;
        domain = "notify";
      }
      if(tts.checked) {
        this.hass.callService(domain, target, {message: "TTS", data: {tts_text: msg, media_stream: "alarm_stream_max"}});
      } else {
        this.hass.callService(domain, target, {message: msg, data: this.config.data});
      }  
    }
    this.content.querySelector("ha-textfield").value = "";
  }

  keydown(e){
    if(e.code == "Enter") this.send();
  }
}

customElements.define('notify-card', NotifyCard);
