(function (audio, Entity, ParticleController, TraitMesh, TraitState) {

	"use strict";

	var Explosive = Entity.extend({

		init: function (planet, pos, geo) {

			this._super(planet, pos);
			this.planet = planet;
			this.geo = geo;
			this.has([TraitMesh, TraitState]);

		},

		init_post: function () {
			this._super();
			this.state.change("born");
		},

		tick: function () {
			switch (this.state.current) {
			case "born":
				this.state.change("countdown");
				break;
			case "countdown":
				if (this.state.count === 100) {
					this.planet.explode(this.pos, this.geo);
					ParticleController.create(this.mesh.position.clone());
					audio.get("explode").backPlay();
					this.state.change("dead");
				}
				break;
			case "dead":
				if (this.state.count === 0) {
					this.remove = true;
				}
				break;
			}
			this._super();
		},

		createMesh: function (opts) {
			opts = opts || {};
			this.mesh = new THREE.Mesh(
				new THREE.SphereGeometry(opts.size || 2, 3, 3),
				new THREE.MeshLambertMaterial({color: 0x550000 })
			);
		}
	});

	window.Explosive = Explosive;

}(audio, Entity, ParticleController, TraitMesh, TraitState));
