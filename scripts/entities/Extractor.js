(function (utils, audio, Entity, TraitMesh, TraitState) {

	"use strict";

	var Extractor = Entity.extend({

		init: function (planet, pos, geo) {

			this._super(planet, pos);
			this.planet = planet;
			this.geo = geo;
			this.altitude = -0.5;
			this.has([TraitMesh, TraitState]);

		},

		init_post: function () {

			this._super();
			this.state.change("born");
			this.haul = 0;

			utils.lookAwayFrom(this.mesh, this.planet.worldMesh);

		},

		tick: function () {

			switch (this.state.current) {

			case "born":
				this.state.change("center");
				break;

			case "center":
				if (this.state.count === 100) {

					this.haul += this.checkHaulInRadius(0);

					this.mesh.scale.multiplyScalar(2);
					audio.get("pulse").backPlay();
					this.state.change("middle");
				}
				break;

			case "middle":
				if (this.state.count === 100) {

					this.haul += this.checkHaulInRadius(1);

					audio.get("pulse").backPlay();
					this.mesh.scale.multiplyScalar(1.5);
					this.state.change("outer");
				}
				break;

			case "outer":
				if (this.state.count === 100) {

					this.haul += this.checkHaulInRadius(2);

					// FIXME: move to planet/level
					var fin = Math.floor(this.haul * 9000);
					if (fin === 0) {
						audio.get("error").backPlay();
						utils.flashMessage("No minerals here! Only deploy on exposed minerals.");
					} else {
						audio.get("win").backPlay();
						utils.flashMessage("Expedition haul: $" + fin);
						window.main.addCash(fin);
					}

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

		checkHaulInRadius: function (radius) {

			var mapRef = this.planet.latLngToMap(this.pos),
				xcell = mapRef[0],
				ycell = mapRef[1],
				haul = 0,
				self = this;

			utils.neighbours(radius, function (x, y) {

				haul += self.checkHaulAtTile([x + xcell, y + ycell]);

			}, true);

			return haul;

		},

		checkHaulAtTile: function (tile) {

			var val = this.planet.getBlockFromTile(tile, true),
				block = this.planet.getBlockFromTile(tile);

			if (block && block.unearthed && !block.collected) {
				this.planet.collectBlock(block);
				return val;
			}
			return 0;

		},

		createMesh: function (opts) {

			this.mesh = window.main.models.extractor.clone();

		}

	});

	window.Extractor = Extractor;

}(utils, audio, Entity, TraitMesh, TraitState));
