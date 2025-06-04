import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { freestyle, roboto } from 'src/app/config/fontscript';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { DatePipe } from '@angular/common';
(window as any).pdfMake.vfs["freestylescript.ttf"] = freestyle;
(window as any).pdfMake.vfs["roboto.ttf"] = roboto;

@Injectable({
  providedIn: 'root'
})
export class GeneratePdfService {
  dates;
  tableData: any;
  dd: any;
  resourceSignedImageURL:any;

  constructor(private datePipe: DatePipe) { }
  getBase64ImageFromURL(url: string) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx!.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL();
        resolve(dataURL);
      };
      img.onerror = error => {
        reject(error);
      };
      img.src = url;
    });
  }


  async generatePDF(row,timesheets,resourceDetails){
    if(resourceDetails.milestones ==  true){
      this.dates = row;
      try{
        const imageBase64 = await this.getBase64ImageFromURL(
          "../../../../assets/images/prutechlogo.png"
        );
          this.tableData = timesheets?.map((item) => {
              return [
                item.milestone_name,
                item.ts_day,
                item.ts_date,
                item.ts_start_time,
                item.meal_start_time,
                item.meal_end_time,
                item.ts_end_time,
                item.work_hour,
                item.comments
              ];
          }) || [];
          function parseTimeString(timeString: string): Date | null {
            const regex = /^(\d{1,2}):(\d{2})\s?([AP]M)?$/i;
            const match = timeString.match(regex);
            if (match) {
              let hours = parseInt(match[1], 10);
              const minutes = parseInt(match[2], 10);
              const period = match[3]?.toUpperCase();
              if (hours === 12 && period === 'AM') {
                hours = 0;
              } else if (hours !== 12 && period === 'PM') {
                hours += 12;
              }
              const date = new Date();
              date.setHours(hours, minutes, 0, 0);
              return date;
            }
            return null;
          }
          pdfMake.fonts={
            FreestyleScript: {
              normal: 'freestylescript.ttf',
    bold: 'freestylescript.ttf',
    italics: 'freestylescript.ttf',
    bolditalics: 'freestylescript.ttf'
          },
          roboto:{
            normal: 'roboto.ttf',
            bold: 'roboto.ttf',
            italics: 'roboto.ttf',
            bolditalics: 'roboto.ttf'
          }
          }
          this.dd = {
            content: [
              {
                columns: [
                  {
    
                    width: '*',
                    alignment: 'right',
                    stack: [
                      {
                        image: imageBase64,
                        fit: [100, 100],
                        alignment: 'left',
                        margin: [0, 0, 5, 0]
                      }
                    ]
                  },
                ]
              },
    
              {
                width: 'auto',
                text: 'Weekly Time sheet',
                alignment: 'center',
                bold: true, // Add bold font weight
                color: '#161A80',
                fontSize: 16,
                margin: [0, -20, 0, 0]
              },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: -30,
                    y1: 8, // Adjust the y1 coordinate to start at the same level as the previous element
                    x2: 547, // Subtracting the right margin
                    y2: 8, // Adjust the y2 coordinate to end at the same level as the previous element
                    lineWidth: 3,
                    lineColor: '#C1C2EF'
                  }
                ]
              },
              {
                text: '',
                margin: [0, 2] // Adjust the top and bottom padding here
              },
              {
                columns: [
                  {
                    width: 100,
                    text: '555 Route 1 South',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 30, 0]
                  },
                  {
                    width: 100,
                    text: 'Resource Name  :',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 5, 0]
                  },
                  {
                    width: '*',
                    text: `${resourceDetails?.resource_name}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [-20, 5, 0, 0]
    
    
                  },
                  {
                    width: 100,
                    text: 'Week Starting  :',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 5, 0]
    
                  },
                  {
                    width: '*',
                    text: `${resourceDetails?.week_start_date}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [-20, 5, 45, 0]
    
                  }
                ],
                columnGap: 30,
              },
              {
                columns: [
                  {
                    width: 100,
                    text: 'Suite # 230',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 30, 0]
                  },
                  {
                    width: 100,
                    text: 'Client Name  :',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 5, 0] // Add top padding of 5 units
                  },
                  {
                    width: '*',
                    text: `${resourceDetails?.client_name}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [-20, 5, 0, 0] // Add top padding of 5 units
                  },
                  {
                    width: 100,
                    text: 'Week Ending  :',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 5, 0] // Add top padding of 5 units
                  },
                  {
                    width: '*',
                    text: `${resourceDetails?.week_end_date}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [-20, 5, 45, 0] // Add top padding of 5 units
                  }
                ],
                columnGap: 30
              },
    
              {
                columns: [
                  {
                    width: 100,
                    text: 'Iselin, NJ 08830',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 30, 0]
                  },
                  {
                    width: 100,
                    text: 'Project Name :',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 5, 0] // Add top padding of 5 units
                  },
                  {
                    width: '*',
                    text:`${resourceDetails?.project_name}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [-20, 5, 0, 0] // Add top padding of 5 units
                  },
                  {
                    width: 100,
                    text: 'Submitted Date  :',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 5, 0]
    
                  },
                  {
                    width: '*',
                    text: `${resourceDetails?.submitted_date}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [-20, 5, 45, 0]
    
                  }
                ],
                columnGap: 30,
              },
    
              {
                columns: [
                  {
                    width: 100,
                    text: '',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 30, 0]
                  },
                  {
                    width: 100,
                    text: 'PruTech Manager :',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 5, 0] // Add top padding of 5 units
                  },
                  {
                    width: '*',
                    text:`${resourceDetails?.project_manager_name}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [-20, 5, 0, 0] // Add top padding of 5 units
                  },
                  {
                    width: 100,
                    text: 'Approved Date :',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: resourceDetails?.approved_date == null ? [0, 5, -15, 0] : [0, 5, 5, 0]
    
                  },
                  {
                    width: '*',
                    text: `${resourceDetails?.approved_date == null ? '' : resourceDetails?.approved_date}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [-20, 5, 45, 0]
    
                  }
                ],
                columnGap: 30,
              },
              {
                columns: [
                  {
                    width: 100,
                    text: '',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 30, 0]
                  },
                  {
                    width: 100,
                    text: 'Timesheet Approver :',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 5, 0] // Add top padding of 5 units
                  },
                  {
                    width: '*',
                    text: `${resourceDetails?.time_approver_name == null ? '' : resourceDetails?.time_approver_name}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [-20, 5, 0, 0] // Add top padding of 5 units
                  },
                  {
                    width: 100,
                    text: '',
                    alignment: 'right',
                    color: 'black',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 5, 0]
    
                  },
                  {
                    width: '*',
                    text: '',
                    alignment: 'left',
                    color: '#5B595D',
                    fontSize: 8,
                    margin: [-20, 5, 45, 0]
    
                  }
                ],
                columnGap: 30,
              },
    
    
              {
                stack: [
                  {
                    table: {
                      headerRows: 1,
                      body: [
                        [
                          { text: 'Milestone', fontSize: 8, alignment: 'center', fillColor: '#9fc1ed' },
                          { text: 'Day', fontSize: 8, alignment: 'center', fillColor: '#9fc1ed' },
                          { text: 'Date', fontSize: 8, alignment: 'center', fillColor: '#9fc1ed' },
                          { text: 'Start Time', fontSize: 8, alignment: 'center', fillColor: '#9fc1ed' },
                          { text: 'Meal Start Time', fontSize: 8, alignment: 'center', fillColor: '#9fc1ed' },
                          { text: 'Meal End Time', fontSize: 8, alignment: 'center', fillColor: '#9fc1ed' },
                          { text: 'End Time', fontSize: 8, alignment: 'center', fillColor: '#9fc1ed' },
                          { text: 'Total', fontSize: 8, alignment: 'center', fillColor: '#9fc1ed' },
                          { text: 'Activity', fontSize: 8, alignment: 'center', fillColor: '#9fc1ed' },
                        ],
                        ...this.tableData.map(row => row.map((cell,i) => ({ text: cell, fontSize: 8, alignment: i == 6 ? 'right' : 'center', bold: false }))),
                        [
                          { text: 'Total Hours', colSpan: 7, fontSize: 8, alignment: 'right', fillColor: '#9fc1ed', bold: true },
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {text: `${resourceDetails?.project_work_hours}`, fontSize: 8, alignment: 'right', fillColor: '#9fc1ed', bold: true },
                          { text: "", fontSize: 8, alignment: 'center', fillColor: '#9fc1ed', bold: true },
                        ],
                      ],
                      widths: [50,45,50,50,50,50,50,40,100], // Set the desired width values for each column
                      layout: {
                        defaultBorder: false,
                        hLineWidth: () => 0.1,
                        vLineWidth: () => 0.1,
                        hLineColor: () => '#464648',
                        vLineColor: () => '#464648',
                      },
                    },
                  },
                ],
                margin: [-25, 10, 0, 0], // Adjust the top padding here
              },
    
              {
                columns: [
                  {
                    width: 100,
                    text: 'Resource E-Signature  :',
                    alignment: 'right',
                    color: 'black',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 70, 5, 0]
    
                  },
                  {
                    width: '*',
                    stack: [
                      // {
    
                      //   width: '*',
                      //   alignment: 'right',
                      //   stack: [
                      //     resourceDetails?.resource_signature ? // Check if resource_signature is not null
                      //       {
                      //         image: `data:image/png;base64,${resourceDetails.resource_signature}`,
                      //         fit: [100, 50],
                      //         alignment: 'left',
                      //         margin: [0, 0, 5, 0]
                      //       }
                      //       : null // Set to null if resource_signature is null
                      //   ]
                      // },
                      {
                        text: `${resourceDetails?.resource_name}`,
                        alignment: 'left',
                        // italics: true,
                        color: 'black',
                        fontSize: 18,
                        font:"FreestyleScript",
                        margin: [0, 40, 5, 10]// Adjust margin as needed
                      },
                      {
                        canvas: [
                          {
                            type: 'line',
                            x1: 0,
                            y1: 1,
                            x2: 120, // Adjust the width of the line as needed
                            y2: 1,
                            lineWidth: 1,
                            lineColor: 'black',
                            margin: [0, 5, 0, 0] // Adjust the gap between line and signature
                          }
                        ]
                      }
                    ],
                    margin: [0, 20, 5, 0] // Adjust margin as needed
                  },
                  {
                    width: 100,
                    text: 'Accepted Date  :',
                    alignment: 'right',
                    color: 'black',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 70, 5, 0] // Add top padding of 5 units
                  },
                  {
                    width: '*',
                    text: `${resourceDetails?.submitted_date}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [0, 70, 5, 0]
    
                  }
    
                ],
                columnGap: 20,
              },
    
              {
                columns: [
                  {
                    width: 100,
                    text: 'Approver E-Signature  :',
                    alignment: 'right',
                    color: 'black',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 70, 5, 0]
    
                  },
                  {
                    width: '*',
                    stack: [
                      // {
    
                      //   width: '*',
                      //   alignment: 'right',
                      //   stack: [
                      //     resourceDetails?.approver_signature ?
                      //     {
                      //       image: `data:image/png;base64,${resourceDetails?.approver_signature}`,
                      //       fit: [100, 50],
                      //       alignment: 'left',
                      //       margin: [0, 0, 5, 0]
                      //     } : null
                      //   ]
                      // },
                      {
                        text: `${resourceDetails?.time_approver_name == null ? '' : resourceDetails?.time_approver_name}`,
                        alignment: 'left',
                        italics: true,
                        color: 'black',
                        fontSize: 18,
                        font:"FreestyleScript",
                        margin: [0, 40, 5, 10]// Adjust margin as needed
                      },
                      {
                        canvas: [
                          {
                            type: 'line',
                            x1: 0,
                            y1: 1,
                            x2: 120, // Adjust the width of the line as needed
                            y2: 1,
                            lineWidth: 1,
                            lineColor: 'black',
                            margin: [0, 5, 0, 0] // Adjust the gap between line and signature
                          }
                        ]
                      }
                    ],
                    margin: resourceDetails?.time_approver_name == null ? [0, 27, 5, 0] :  [0, 20, 5, 0]// Adjust margin as needed
                  },
                  {
                    width: 100,
                    text: 'Approved Date  :',
                    alignment: 'right',
                    color: 'black',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 70, 5, 0] // Add top padding of 5 units
                  },
                  {
                    width: '*',
                    text: `${resourceDetails?.approved_date == null ? '' : resourceDetails?.approved_date}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [0, 70, 5, 0]
    
                  }
                ],
                columnGap: 20,
              },
            ],
            defaultStyle:{
              font: 'roboto',
            }
          };
        // pdfMake.createPdf(this.dd).download(`${resourceDetails.resource_name} (${resourceDetails.project_name}) (${this.datePipe.transform(resourceDetails.week_start_date, 'EEE, MMM d, y')} - ${this.datePipe.transform(resourceDetails.week_end_date, 'EEE, MMM d, y')})`);
        const pdfDocGenerator = pdfMake.createPdf(this.dd);

        // Open the PDF in a new tab
        pdfDocGenerator.open();
      }
      catch (error) {
        console.error('Error generating PDF:', error);
      }
    }
    if(resourceDetails.milestones == false){
      this.dates = row;
      try{
        const imageBase64 = await this.getBase64ImageFromURL(
          "../../../../assets/images/prutechlogo.png"
        );
          this.tableData = timesheets?.map((item) => {
              return [
                item.ts_day,
                item.ts_date,
                item.ts_start_time,
                item.meal_start_time,
                item.meal_end_time,
                item.ts_end_time,
                item.work_hour,
                item.comments
              ];
          }) || [];
          function parseTimeString(timeString: string): Date | null {
            const regex = /^(\d{1,2}):(\d{2})\s?([AP]M)?$/i;
            const match = timeString.match(regex);
            if (match) {
              let hours = parseInt(match[1], 10);
              const minutes = parseInt(match[2], 10);
              const period = match[3]?.toUpperCase();
              if (hours === 12 && period === 'AM') {
                hours = 0;
              } else if (hours !== 12 && period === 'PM') {
                hours += 12;
              }
              const date = new Date();
              date.setHours(hours, minutes, 0, 0);
              return date;
            }
            return null;
          }
          pdfMake.fonts={
            FreestyleScript: {
              normal: 'freestylescript.ttf',
    bold: 'freestylescript.ttf',
    italics: 'freestylescript.ttf',
    bolditalics: 'freestylescript.ttf'
          },
          roboto:{
            normal: 'roboto.ttf',
            bold: 'roboto.ttf',
            italics: 'roboto.ttf',
            bolditalics: 'roboto.ttf'
          }
          }
          this.dd = {
            content: [
              {
                columns: [
                  {
    
                    width: '*',
                    alignment: 'right',
                    stack: [
                      {
                        image: imageBase64,
                        fit: [100, 100],
                        alignment: 'left',
                        margin: [0, 0, 5, 0]
                      }
                    ]
                  },
                ]
              },
    
              {
                width: 'auto',
                text: 'Weekly Time sheet',
                alignment: 'center',
                bold: true, // Add bold font weight
                color: '#161A80',
                fontSize: 16,
                margin: [0, -20, 0, 0]
              },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: -30,
                    y1: 8, // Adjust the y1 coordinate to start at the same level as the previous element
                    x2: 547, // Subtracting the right margin
                    y2: 8, // Adjust the y2 coordinate to end at the same level as the previous element
                    lineWidth: 3,
                    lineColor: '#C1C2EF'
                  }
                ]
              },
              {
                text: '',
                margin: [0, 2] // Adjust the top and bottom padding here
              },
              {
                columns: [
                  {
                    width: 100,
                    text: '555 Route 1 South',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 30, 0]
                  },
                  {
                    width: 100,
                    text: 'Resource Name  :',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 5, 0]
                  },
                  {
                    width: '*',
                    text: `${resourceDetails?.resource_name}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [-20, 5, 0, 0]
    
    
                  },
                  {
                    width: 100,
                    text: 'Week Starting  :',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 5, 0]
    
                  },
                  {
                    width: '*',
                    text: `${resourceDetails?.week_start_date}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [-20, 5, 45, 0]
    
                  }
                ],
                columnGap: 30,
              },
              {
                columns: [
                  {
                    width: 100,
                    text: 'Suite # 230',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 30, 0]
                  },
                  {
                    width: 100,
                    text: 'Client Name  :',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 5, 0] // Add top padding of 5 units
                  },
                  {
                    width: '*',
                    text: `${resourceDetails?.client_name}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [-20, 5, 0, 0] // Add top padding of 5 units
                  },
                  {
                    width: 100,
                    text: 'Week Ending  :',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 5, 0] // Add top padding of 5 units
                  },
                  {
                    width: '*',
                    text: `${resourceDetails?.week_end_date}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [-20, 5, 45, 0] // Add top padding of 5 units
                  }
                ],
                columnGap: 30
              },
    
              {
                columns: [
                  {
                    width: 100,
                    text: 'Iselin, NJ 08830',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 30, 0]
                  },
                  {
                    width: 100,
                    text: 'Project Name :',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 5, 0] // Add top padding of 5 units
                  },
                  {
                    width: '*',
                    text:`${resourceDetails?.project_name}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [-20, 5, 0, 0] // Add top padding of 5 units
                  },
                  {
                    width: 100,
                    text: 'Submitted Date  :',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 5, 0]
    
                  },
                  {
                    width: '*',
                    text: `${resourceDetails?.submitted_date}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [-20, 5, 45, 0]
    
                  }
                ],
                columnGap: 30,
              },
    
              {
                columns: [
                  {
                    width: 100,
                    text: '',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 30, 0]
                  },
                  {
                    width: 100,
                    text: 'PruTech Manager :',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 5, 0] // Add top padding of 5 units
                  },
                  {
                    width: '*',
                    text:`${resourceDetails?.project_manager_name}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [-20, 5, 0, 0] // Add top padding of 5 units
                  },
                  {
                    width: 100,
                    text: 'Approved Date  :',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: resourceDetails?.approved_date == null ? [0, 5, -15, 0] : [0, 5, 5, 0]
    
                  },
                  {
                    width: '*',
                    text: `${resourceDetails?.approved_date == null ? '' : resourceDetails?.approved_date}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [-20, 5, 45, 0]
    
                  }
                ],
                columnGap: 30,
              },
              {
                columns: [
                  {
                    width: 100,
                    text: '',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 30, 0]
                  },
                  {
                    width: 100,
                    text: 'Timesheet Approver :',
                    alignment: 'right',
                    color: '#161A80',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 5, 0] // Add top padding of 5 units
                  },
                  {
                    width: '*',
                    text: `${resourceDetails?.time_approver_name == null ? '' : resourceDetails?.time_approver_name}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [-20, 5, 0, 0] // Add top padding of 5 units
                  },
                  {
                    width: 100,
                    text: '',
                    alignment: 'right',
                    color: 'black',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 5, 5, 0]
    
                  },
                  {
                    width: '*',
                    text: '',
                    alignment: 'left',
                    color: '#5B595D',
                    fontSize: 8,
                    margin: [-20, 5, 45, 0]
    
                  }
                ],
                columnGap: 30,
              },
    
    
              {
                stack: [
                  {
                    table: {
                      headerRows: 1,
                      body: [
                        [
                          // { text: 'Milestone', fontSize: 8, alignment: 'center', fillColor: '#9fc1ed' },
                          { text: 'Day', fontSize: 8, alignment: 'center', fillColor: '#9fc1ed' },
                          { text: 'Date', fontSize: 8, alignment: 'center', fillColor: '#9fc1ed' },
                          { text: 'Start Time', fontSize: 8, alignment: 'center', fillColor: '#9fc1ed' },
                          { text: 'Meal Start Time', fontSize: 8, alignment: 'center', fillColor: '#9fc1ed' },
                          { text: 'Meal End Time', fontSize: 8, alignment: 'center', fillColor: '#9fc1ed' },
                          { text: 'End Time', fontSize: 8, alignment: 'center', fillColor: '#9fc1ed' },
                          { text: 'Total', fontSize: 8, alignment: 'center', fillColor: '#9fc1ed' },
                          { text: 'Activity', fontSize: 8, alignment: 'center', fillColor: '#9fc1ed' },
                        ],
                        ...this.tableData.map(row => row.map((cell,i) => ({ text: cell, fontSize: 8, alignment: i == 6 ?'right' : 'center', bold: false }))),
                        [
                          { text: 'Total Hours', colSpan: 6, fontSize: 8, alignment: 'right', fillColor: '#9fc1ed', bold: true },
                          {},
                          {},
                          {},
                          {},
                          {},
                          // {},
                          {text: `${resourceDetails?.project_work_hours}`, fontSize: 8, alignment: 'right', fillColor: '#9fc1ed', bold: true },
                          { text: "", fontSize: 8, alignment: 'center', fillColor: '#9fc1ed', bold: true },
                        ],
                      ],
                      widths: [45,50,50,50,50,50,40,120], // Set the desired width values for each column
                      layout: {
                        defaultBorder: false,
                        hLineWidth: () => 0.1,
                        vLineWidth: () => 0.1,
                        hLineColor: () => '#464648',
                        vLineColor: () => '#464648',
                      },
                    },
                  },
                ],
                margin: [-5, 10, 0, 0], // Adjust the top padding here
              },
    
              {
                columns: [
                  {
                    width: 100,
                    text: 'Resource E-Signature  :',
                    alignment: 'right',
                    color: 'black',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 70, 5, 0]
    
                  },
                  {
                    width: '*',
                    stack: [
                      // {
    
                      //   width: '*',
                      //   alignment: 'right',
                      //   stack: [
                      //     resourceDetails?.resource_signature ? // Check if resource_signature is not null
                      //       {
                      //         image: `data:image/png;base64,${resourceDetails.resource_signature}`,
                      //         fit: [100, 50],
                      //         alignment: 'left',
                      //         margin: [0, 0, 5, 0]
                      //       }
                      //       : null // Set to null if resource_signature is null
                      //   ]
                      // },
                      {
                        text: `${resourceDetails?.resource_name}`,
                        alignment: 'left',
                        // italics: true,
                        color: 'black',
                        fontSize: 18,
                        font:'FreestyleScript',
                        margin: [0, 40, 5, 10]// Adjust margin as needed
                      },
                      {
                        canvas: [
                          {
                            type: 'line',
                            x1: 0,
                            y1: 1,
                            x2: 120, // Adjust the width of the line as needed
                            y2: 1,
                            lineWidth: 1,
                            lineColor: 'black',
                            margin: [0, 5, 0, 0] // Adjust the gap between line and signature
                          }
                        ]
                      }
                    ],
                    margin: [0, 20, 5, 0] // Adjust margin as needed
                  },

                  {
                    width: 100,
                    text: 'Accepted Date  :',
                    alignment: 'right',
                    color: 'black',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 70, 5, 0] // Add top padding of 5 units
                  },
                  {
                    width: '*',
                    text: `${resourceDetails?.submitted_date}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [0, 70, 5, 0]
    
                  }
    
                ],
                columnGap: 20,
              },
    
              {
                columns: [
                  {
                    width: 100,
                    text: 'Approver E-Signature  :',
                    alignment: 'right',
                    color: 'black',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 70, 5, 0]
    
                  },
                  {
                    width: '*',
                    stack: [
                      // {
    
                      //   width: '*',
                      //   alignment: 'right',
                      //   stack: [
                      //     resourceDetails?.approver_signature ?
                      //     {
                      //       image: `data:image/png;base64,${resourceDetails?.approver_signature}`,
                      //       fit: [100, 50],
                      //       alignment: 'left',
                      //       margin: [0, 0, 5, 0]
                      //     } : null
                      //   ]
                      // },
                      {
                        text: `${resourceDetails?.time_approver_name == null ? '' : resourceDetails?.time_approver_name}`,
                        alignment: 'left',
                        // italics: true,
                        color: 'black',
                        fontSize: 18,
                        font:'FreestyleScript',
                        margin: [0, 40, 5, 10]// Adjust margin as needed
                      },
                      {
                        canvas: [
                          {
                            type: 'line',
                            x1: 0,
                            y1: 1,
                            x2: 120, // Adjust the width of the line as needed
                            y2: 1,
                            lineWidth: 1,
                            lineColor: 'black',
                            margin: [0, 5, 0, 0] // Adjust the gap between line and signature
                          }
                        ]
                      }
                    ],
                    margin: resourceDetails?.time_approver_name == null ? [0, 27, 5, 0] :  [0, 20, 5, 0]// Adjust margin as needed
                  },
                  {
                    width: 100,
                    text: 'Approved Date  :',
                    alignment: 'right',
                    color: 'black',
                    bold: true,
                    fontSize: 8,
                    margin: [0, 70, 5, 0] // Add top padding of 5 units
                  },
                  {
                    width: '*',
                    text: `${resourceDetails?.approved_date == null ? '' : resourceDetails?.approved_date}`,
                    alignment: 'left',
                    color: 'black',
                    fontSize: 8,
                    margin: [0, 70, 5, 0]
    
                  }
                ],
                columnGap: 20,
              },
            ],
            defaultStyle:{
              font: 'roboto',
            }
          };
          const pdfDocGenerator = pdfMake.createPdf(this.dd);

          // Open the PDF in a new tab
          pdfDocGenerator.open();      
        }
      catch (error) {
        console.error('Error generating PDF:', error);
      }
    }
  }
}
