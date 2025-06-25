import { TranslateService } from '@ngx-translate/core';
import { first, map, min } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RobotSettings, OperatorScreenPresenterAPI, OperatorScreenPresenter } from '@universal-robots/contribution-api';
import { AlumotionscreenModel } from './AlumotionScreenModel';
import { AlumotionWorkpiece } from './Workpiece.interface';
import { CassettoProfeeder } from './Cassetti.interface';
import { XmlRpcClient } from '../../xmlrpc/xmlrpc-client';
import { URCAP_ID, VENDOR_ID } from '../../../generated/contribution-constants';

@Component({
    templateUrl: './AlumotionScreen.component.html',
    styleUrls: ['./AlumotionScreen.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AlumotionscreenComponent implements OperatorScreenPresenter, OnChanges, OnInit {

    @Input() presenterAPI: OperatorScreenPresenterAPI;
    @Input() robotSettings: RobotSettings;
    @Input() operatorScreen: AlumotionscreenModel;

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef
    ) {
    }

    passwordOk: boolean = false;
    password: string = "collaborate";

    showChoice: boolean = true;
    showFormats: boolean = false;
    showMachine: boolean = false;
    showProfeeder: boolean = false;

    drawerCanvas: any;
    xmlrpc: any;

    cassetti: Array<CassettoProfeeder>;

    formats: Array<AlumotionWorkpiece>;
    formatsNames: Array<string>;
    formatSelected: 0;

    points: any;

    showOpScreen: boolean;

    ngOnChanges(changes: SimpleChanges): void {

        if (changes?.robotSettings) {
            if (!changes?.robotSettings?.currentValue) {
                return;
            }

            if (changes?.robotSettings?.isFirstChange()) {
                if (changes?.robotSettings?.currentValue) {
                    this.translateService.use(changes?.robotSettings?.currentValue?.language);
                }
                this.translateService.setDefaultLang('en');
            }

            this.translateService
                .use(changes?.robotSettings?.currentValue?.language)
                .pipe(first())
                .subscribe(() => {
                    this.cd.detectChanges();
                });
        }
    }

    ngOnInit(): void {

        this.presenterAPI.programExecutionService.getProgramStatus().subscribe((d) => {
            if (d == "STOPPED") {
                this.showOpScreen = true;
            } else {
                this.showOpScreen = false;
                console.log("Test?")
            }
            console.log("Test test test");
            this.cd.detectChanges();
        });

        const url = this.presenterAPI.getContainerContributionURL(VENDOR_ID, URCAP_ID, 'alumotionscreen-backend', 'xmlrpc');
        this.xmlrpc = new XmlRpcClient(`${location.protocol}//${url}/`);

        console.log("Init started")
        var data = this.xmlrpc.methodCall("get_data").then((d) => {
            var dataParsed = JSON.parse(d);
            this.formats = dataParsed.formats;
            this.cassetti = dataParsed.drawers;
            this.points = dataParsed.points
            this.formatsNames = this.formats.map(({ name }) => name);
            this.formatSelected = 0;
            console.log("Data fetched correctly");
            console.log(dataParsed);
            console.log("End of data fetched");
            this.cd.detectChanges();
        });
        //console.log(data.toString());

    }

    openFormatsDialog() {
        this.showFormats = true;
        this.showChoice = false;
        this.updateCanvas();
        this.cd.detectChanges();
    }

    openProfeederDialog() {
        this.showProfeeder = true;
        this.showChoice = false;
        this.cd.detectChanges();
    }

    openMachineDialog() {
        this.showMachine = true;
        this.showChoice = false;
        this.cd.detectChanges();
    }

    openChoiceDialog() {
        this.showFormats = false;
        this.showProfeeder = false;
        this.showMachine = false;
        this.showChoice = true;
        this.cd.detectChanges();
    }

    checkPassword($event) {
        if ($event.srcElement.value === this.password) {
            this.passwordOk = true;
        } else {
            this.passwordOk = false;
        }
        this.cd.detectChanges();
    }

    enableDrawer($event, index) {
        this.cassetti[index].abilitato = !this.cassetti[index].abilitato;
        this.xmlrpcUpdateData();
        this.cd.detectChanges();
    }

    selectFormat($event, index) {
        this.cassetti[index].format = $event;
        this.xmlrpcUpdateData();
        this.cd.detectChanges();
    }

    async setStartPoint($event, index) {
        const waypoint = await this.presenterAPI.robotMoveService.openMoveScreen({
            moveScreenTarget: 'waypoint',
            moveScreenTargetLabel: ''
        })

        this.cassetti[index].taughtOrigin = waypoint;
        this.xmlrpcUpdateData();
        console.log(waypoint)
        this.cd.detectChanges();

    }

    changeFormatProperty($event, property) {
        this.formats[this.formatSelected][property] = $event.srcElement.value;
        this.formatsNames = this.formats.map(({ name }) => name);
        this.updateCanvas();
        this.xmlrpcUpdateData();
        this.cd.detectChanges();
    }

    updateCanvas() {
        setTimeout(() => {
            this.drawerCanvas = document.getElementById("myCanvas");
            const ctx = this.drawerCanvas.getContext("2d");
            ctx.fillStyle = "#97c4e4";

            let edgeX = 140;
            let edgeY = 50;

            let r = 10;

            ctx.clearRect(0, 0, 500, 500);
            try {
                for (let j = 0; j < this.formats[this.formatSelected].ny; j++) {
                    for (let i = 0; i < this.formats[this.formatSelected].nx; i++) {
                        ctx.beginPath();
                        ctx.arc(edgeX + this.formats[this.formatSelected].dx * i, edgeY + j * this.formats[this.formatSelected].dy, r, 0, 2 * Math.PI, true);
                        ctx.stroke();
                        ctx.fill();
                        ctx.closePath();
                    }
                }
            } catch (error) {
                console.log("Cannot render canvas!!");
                console.log(error);
                console.log(this.formats)
                console.log(this.formatSelected);
                console.log("End of canvas data")
            }
        }, 50);
    }

    addFormat() {
        this.formats.push({ name: "Nuovo formato", dx: 50, dy: 50, nx: 5, ny: 5, mass: 1 });
        this.formatsNames = this.formats.map(({ name }) => name);
        this.updateCanvas();
        this.xmlrpcUpdateData();
        this.cd.detectChanges();
    }

    removeFormat() {
        if (this.formats.length > 1) {

            for (let i = 0; i < 6; i++) {
                if (this.cassetti[i]["format"] == this.formats[this.formatSelected]["name"]) {
                    this.cassetti[i]["format"] = undefined;
                    this.cassetti[i]["abilitato"] = false;
                    this.cassetti[i]["taughtOrigin"] = {};
                }
            }

            this.formats.splice(this.formatSelected, 1);
            this.formatSelected = 0;
            this.formatsNames = this.formats.map(({ name }) => name);

            this.updateCanvas();
            this.xmlrpcUpdateData();
        }
        this.cd.detectChanges();
    }

    selectFormatFormats(index) {
        this.formatSelected = index;
        this.updateCanvas();
        this.xmlrpcUpdateData();
        this.cd.detectChanges();
    }

    xmlrpcUpdateData() {
        console.log("Updating data")
        this.xmlrpc.methodCall("set_data", JSON.stringify({ formats: this.formats, drawers: this.cassetti, points: this.points }));
    }

    async setFlyPoint($event) {
        const waypoint = await this.presenterAPI.robotMoveService.openMoveScreen({
            moveScreenTarget: 'waypoint',
            moveScreenTargetLabel: ''
        })

        this.points[0] = waypoint;
        this.xmlrpcUpdateData();
        console.log(waypoint)
        this.cd.detectChanges();

    }

    async setInsertionPoint($event) {
        const waypoint = await this.presenterAPI.robotMoveService.openMoveScreen({
            moveScreenTarget: 'waypoint',
            moveScreenTargetLabel: ''
        })

        this.points[1] = waypoint;
        this.xmlrpcUpdateData();
        console.log(waypoint);
        this.cd.detectChanges();

    }

    async setBackPoint($event) {
        const waypoint = await this.presenterAPI.robotMoveService.openMoveScreen({
            moveScreenTarget: 'waypoint',
            moveScreenTargetLabel: ''
        })

        this.points[2] = waypoint;
        this.xmlrpcUpdateData();
        console.log(waypoint);
        this.cd.detectChanges();

    }

}
