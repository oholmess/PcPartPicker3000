import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  getLaptopDataPromise,
  getCPUs, 
  getGPUs, 
  getOSes, 
  Laptop 
} from "@/services/laptopData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ScatterChart, Scatter, ZAxis, Cell } from "recharts";

import { getPricePrediction, getKSimilarProducts } from "@/util/cloud_function";

const osOptions = [ "Windows 11 Home",
                    "macOS Sequoia",
                    "sin sistema operativo",
                    "Windows 11 Professional",
                    "macOS Sonoma",
                    "Free DOS",
                    "macOS Monterey",
                    "Windows 10 Home",
                    "Windows 10 Professional",
                    "macOS Catalina",
                    "Windows 11 S",
                    "Chrome OS",
                    "macOS Big Sur",
                    "macOS Ventura",
                    "Windows 10 S",
                    "Mac OS X",
                    "Linux",
                    "Endless OS",
                    "Windows 8",
                    "macOS Mojave",
                    "macOS Sierra",
                    "Microsoft Windows 11 Professional",
                    "FreeDOS",
                    "ninguno",
                    "Microsoft Windows 11 Home",
                    "Microsoft Windows 10 Home",
                    "Microsoft Windows 10 Professional",
                    "Google Chrome OS",
                    "Microsoft Windows 11 IoT Enterprise",
                    "Windows 10 IoT Enterprise",
                    "Microsoft Windows 10",
                    "configurable",
                    "Google Android",
                    "Wyse Thin OS",
                    "IGEL OS",
                    "DOS",
                    "Microsoft Windows 8.1",
                    "HP ThinPro",
                    "Microsoft Windows 8 Professional",
                    "Microsoft Windows 7 Professional",
                    "Microsoft Windows Embedded"
]

const cpuOptions = [
    "Apple M3",
    "Unknown",
    "Intel Core i7-13700H",
    "Intel Core Ultra 7 155H",
    "AMD Ryzen AI 9 HX 370",
    "Intel Core Ultra 9 185H",
    "AMD Ryzen 7 8840HS",
    "Intel Core i7-13620H",
    "AMD Ryzen 7 7435HS",
    "AMD Ryzen 9 8945HS",
    "Intel Celeron N4500",
    "Intel Core i5-1335U",
    "Apple M4",
    "AMD Ryzen 5 7520U",
    "Intel Core 3 100U",
    "Intel Core i7-14650HX",
    "Qualcomm Snapdragon X Plus X1P-42-100",
    "AMD Ryzen 5 3500U",
    "Intel Core i9-13900H",
    "Intel Core Ultra 7 155U",
    "Apple M2",
    "Apple M4 Pro",
    "Intel Core i5-12450H",
    "Apple M4 Max",
    "Intel Celeron N4020",
    "AMD Ryzen 7 7735HS",
    "Intel Core i5-1135G7",
    "Intel Core 5 120U",
    "Intel Core i7-1255U",
    "Intel Core i5-12500H",
    "Qualcomm Snapdragon X Elite X1E-80-100",
    "AMD Ryzen 7 6800H",
    "Intel Core i7-13650HX",
    "AMD Ryzen 7 7735U",
    "Intel Core i3-1115G4",
    "Intel Core Ultra 5 125H",
    "Intel Core Ultra 7 256V",
    "AMD Ryzen 9 7945HX",
    "Intel Core i5-13500H",
    "AMD Ryzen 5 7530U",
    "AMD Ryzen 7 7840HS",
    "AMD Ryzen AI 7 Pro 350",
    "Intel Core i3-N305",
    "Intel Core Ultra 9 285H",
    "Intel Core i3-1315U",
    "AMD Ryzen 7 8845HS",
    "AMD Ryzen AI 9 365",
    "Intel Core i9-13900HX",
    "Intel Core i5-1340P",
    "AMD Ryzen 5 5500U",
    "Qualcomm Snapdragon X Plus X1P-64-100",
    "AMD Ryzen 5 5600H",
    "AMD Ryzen 5 7535HS",
    "Intel Core i7-1355U",
    "Intel Core i5-13420H",
    "AMD Ryzen 7 7730U",
    "AMD Ryzen 5 7535U",
    "Intel Core i5-1334U",
    "AMD Ryzen 7 3700U",
    "Qualcomm Kryo 495",
    "Intel Core i9-13980HX",
    "Intel Core 7 150U",
    "Intel Core i9-14900HX",
    "Intel Core i7-12650H",
    "Intel Core i3-1215U",
    "Intel Core i5-1235U",
    "MediaTek MT8183",
    "AMD Ryzen 3 5425U",
    "Qualcomm Snapdragon X Elite X1E-78-100",
    "Intel Core Ultra 5 125U",
    "AMD Ryzen 7 5700U",
    "Intel Core i5-12450HX",
    "Intel Core i7-1265U",
    "AMD Ryzen 5 5500H",
    "Qualcomm Snapdragon X Elite X1E-84-100",
    "Intel Core i5-8259U",
    "Intel Core i7-1360P",
    "Intel Core i5-1240P",
    "Intel Core Ultra 7 258V",
    "AMD Ryzen 5 5625U",
    "AMD Ryzen 7 7745HX",
    "AMD Ryzen 3 5300U",
    "AMD A4-9120C",
    "Intel Atom x5-Z8350",
    "Intel Core i7-11800H",
    "Intel Core i7-14700HX",
    "Apple M3 Pro",
    "Intel Core i7-12700H",
    "AMD Ryzen 3 7320C",
    "Intel Celeron N4120",
    "AMD Ryzen 7 6800HS",
    "Intel Processor N100",
    "AMD Ryzen 3 7320U",
    "Intel Core i5-11400H",
    "AMD 3015e",
    "AMD Ryzen 5 Pro 5650U",
    "Intel Core i7-13700HX",
    "Intel Core Ultra 7 165H",
    "Apple M3 Max",
    "Intel Core i5-8365U",
    "Intel Core Ultra 5 135H",
    "Intel Pentium N6000",
    "AMD Ryzen 5 7430U",
    "Intel Core i7-13800H",
    "Intel Core i5-11300H",
    "AMD Athlon Silver 3050U",
    "Intel Core Ultra 7 255H",
    "AMD Ryzen 3 7330U",
    "Intel Core i5-11320H",
    "Apple M1",
    "Intel Core i7-1185G7",
    "Intel Core i9-12900H",
    "Intel Core Ultra 7 165U",
    "Intel Core i7-13850HX",
    "AMD Ryzen 7 5825C",
    "Intel Celeron N3050",
    "AMD Ryzen 7 Pro 6850U",
    "Intel Core i5-1155G7",
    "AMD Ryzen 5 8645HS",
    "Intel Core Ultra 7 164U",
    "Intel Core i5-1345U",
    "Intel Celeron N5100",
    "Intel Core i9-13950HX",
    "Intel Core i7-12800HX",
    "Intel Core i3-10110U",
    "Intel Core i7-8550U",
    "Intel Core i5-1245U",
    "Intel Core i3-1005G1",
    "Intel Core i5-1130G7",
    "Intel Core i5-1035G1",
    "Intel Core i9-12900HX",
    "AMD Ryzen 9 7940HS",
    "AMD Ryzen 5 Pro 6650U",
    "Intel Core i7-1195G7",
    "AMD Ryzen 3 3250U",
    "Intel Core i5-1145G7",
    "AMD Ryzen 7 Pro 7840U",
    "Intel Core i7-12800H",
    "AMD Ryzen 7 8840U",
    "Intel Pentium 6405U",
    "Qualcomm Snapdragon 8cx Gen3",
    "Intel Core i7-1165G7",
    "AMD 3015Ce",
    "Intel Core i7-10750H",
    "Intel Core i7-10875H",
    "Intel Core i7-11370H",
    "Intel Core i5-10210U",
    "Intel Core i7-1260P",
    "AMD Ryzen 7 5800HS",
    "AMD Athlon 3150U",
    "Intel Core i7-12850HX",
    "Intel Core i9-10980HK",
    "Intel Core i7-1065G7",
    "Intel Core i9-11950H",
    "Intel Core i5-8350U",
    "Intel Celeron N4000",
    "AMD Ryzen 7 Pro 7840HS",
    "Intel Core i7-1280P",
    "Intel Core i7-1365U",
    "AMD Ryzen 5 6600H",
    "AMD Ryzen 7 5800H",
    "AMD Ryzen 7 5825U",
    "AMD Ryzen 5 Pro 5675U",
    "AMD Ryzen 3 5425C",
    "MediaTek Kompanio 500 MT8183",
    "AMD Ryzen 7 7840U",
    "Intel Core i5-10300H",
    "Intel Core Ultra 5 226V",
    "AMD Ryzen 9 5900HX",
    "AMD 3020e",
    "Intel Celeron N3350",
    "AMD Ryzen 9 7845HX",
    "Intel Processor N200",
    "AMD Ryzen 5 Pro 3500U",
    "Intel Core i5-13500HX",
    "Intel Core i7-1160G7",
    "Intel Core i7-10870H",
    "AMD Ryzen 5 3450U",
    "Intel Processor N97",
    "AMD Ryzen 3 3200U",
    "Apple M2 Pro",
    "Intel Core i5-13450HX",
    "Apple M1 Pro",
    "AMD Ryzen AI 9 HX 375",
    "AMD Ryzen 5 7235HS",
    "AMD Ryzen 5 7640HS",
    "AMD Ryzen 5 8640H",
    "Intel Core Ultra 5 134U",
    "Intel Core i5-14500HX",
    "Intel Core i5-6300U",
    "AMD Ryzen 5 3580U",
    "Intel Core i7-10510U",
    "AMD Ryzen 9 6900HX",
    "Intel Core i5-1035G7",
    "Qualcomm Snapdragon 7180c",
    "Intel Core i5-L16G7",
    "AMD Ryzen 7 Pro 5850U",
    "Intel Core i5-5287U",
    "AMD Ryzen 7 Pro 7730U",
    "AMD Ryzen 9 6900HS",
    "Intel Core i5-8265U",
    "AMD Ryzen 9 Pro 6950HS",
    "Intel Core i9-12950HX",
    "Intel Core i5-7200U",
    "Intel Core i9-11900H",
    "Intel Core i3-6006U",
    "AMD Ryzen 5 4500U",
    "Intel Pentium 4415U",
    "Intel Core i5-10500H",
    "Intel Core i3-1210U",
    "AMD Ryzen 7 Pro 6850H",
    "Intel Core i9-12900HK",
    "Intel Pentium Gold 7505",
    "Intel Core i5-14450HX",
    "Intel Core i5-9300HF",
    "AMD Ryzen 9 Pro 7940HS",
    "Intel Core i7-8750H",
    "Intel Core i7-1250U",
    "AMD Ryzen 5 7540U",
    "AMD Ryzen 5 Pro 7540U",
    "Intel Core i7-13705H",
    "AMD Ryzen 9 7940HX",
    "Intel Core i3-1125G4",
    "Intel Core i7-9750H",
    "Intel Core i7-8565U",
    "AMD Ryzen 5 8640U",
    "Qualcomm Snapdragon 8cx",
    "Intel Core i5-1250P",
    "Intel Celeron",
    "AMD Ryzen 5 5600G",
    "Intel Core i5-13400F",
    "AMD Ryzen 7 5800X",
    "Intel Core i7-12700F",
    "Intel Core i9-14900K",
    "Intel Core i9-12900KF",
    "AMD Ryzen 5 4500",
    "Intel Celeron J3160",
    "Intel N200",
    "Intel Core i5-13600KF",
    "Intel Core i7-6700",
    "AMD Ryzen 7 3700X",
    "AMD Ryzen 5 5600",
    "Intel Core i9-12900",
    "Intel Core i5-12400F",
    "Intel Core i7-10700F",
    "Intel Core i5-14600KF",
    "AMD Ryzen 7 5700G",
    "Intel Core i5-14400F",
    "AMD Ryzen 5 Pro 4650G",
    "Intel N100",
    "AMD Ryzen 7 5700X",
    "Intel Core i3-14100",
    "Intel Core i7-14700F",
    "Intel Core i9-13900",
    "Intel Core i3-13100",
    "Intel Core i5-12400",
    "Intel Core i5-13400",
    "Intel Core i5-7500",
    "Intel Core i7-10700",
    "AMD Ryzen 5 5600X",
    "Intel Core i5-14500",
    "AMD Ryzen 7 8745HS",
    "Intel Core i9-13900K",
    "Intel Celeron N5095",
    "AMD Ryzen 7 8745H",
    "Intel Core i9-14900KF",
    "Intel Core i7-14700",
    "Intel Core i7-13700",
    "Intel Celeron J4025",
    "Intel Core i5-12500",
    "Intel Core i5-13500",
    "Intel Core i5-13500T",
    "Intel Celeron N5105",
    "Intel Pentium N5000",
    "Intel Core i5-14500T",
    "Intel Celeron 7305",
    "Intel Core i3-1220P",
    "Intel Xeon w3-2423",
    "Intel Xeon w3-2425",
    "Intel Core i5-1350P",
    "Intel Core i7-1270P",
    "Intel Core i5 1350PE",
    "Intel Core i7-13700T",
    "Intel Core i5-14400",
    "Inter Core i7-12700",
    "AMD Ryzen 9 PRO 6950H",
    "Intel Core i3-10100",
    "Intel Core i7-14700K",
    "AMD Ryzen 5 7600X",
    "Apple M2 Max",
    "AMD Ryzen 7 8700F",
    "AMD Ryzen 7 8700G",
    "Intel Core i5-12500T",
    "AMD Ryzen 7 7800X3D",
    "Intel Core i5-10400",
    "AMD Ryzen 5 3600",
    "Intel Core i3-10105F",
    "Intel Core i5-11400",
    "Intel Core i5-12600",
    "Intel Xeon E5",
    "AMD Ryzen 7 3750H",
    "AMD Ryzen 5 7500F",
    "Intel Core i3-12100T",
    "Intel Core i7-11700K",
    "Intel Core i7-11700",
    "Intel Core i3-1315UE",
    "Intel Celeron N4505",
    "Intel Core i7-13700K",
    "AMD Ryzen 7 5800",
    "Intel Core i3-13100T",
    "AMD Ryzen 5 8500GE",
    "AMD Ryzen Threadripper PRO 3975WX",
    "AMD Ryzen 7 Pro 5845",
    "AMD Ryzen 3 5300G",
    "Intel Core i3-12100",
    "Intel Core i5-10400T",
    "AMD Ryzen 7 PRO 8700GE",
    "Intel Xeon w5-2445",
    "AMD Ryzen 7 7735H",
    "Intel Atom x7211E",
    "Intel Core i7-13700F",
    "Apple M2 Ultra",
    "AMD Ryzen 5 4600H",
    "Intel N95",
    "Intel Core i7-8700",
    "Intel Core i7-4790",
    "Intel Core i5-12600KF",
    "Intel Core i5-14600",
    "Intel Core i7-13700KF",
    "AMD Ryzen 9 5900X",
    "Intel Core i9-14900",
    "Intel Core i5-11400F",
    "Intel Xeon w5-2455X",
    "Intel Core i7-14700T",
    "Intel Core i5-1145GRE",
    "Intel Core i7-12700K",
    "Intel Core i5-13400T",
    "Intel Core i7-1370P",
    "Intel Core i5-1340PE",
    "Intel Core i7-12700T",
    "Intel Core i5-11400T",
    "AMD Ryzen 5 4600G",
    "Intel Core i7-10710U",
    "AMD Ryzen 3 3200G",
    "Intel Celeron J4125",
    "Intel Core i3-N300",
    "AMD Ryzen 5 5600GE",
    "Intel Core i5-10505",
    "Intel Pentium Silver N6005",
    "Intel Core i5-10500",
    "AMD Ryzen 7 5700GE",
    "Intel Core i7-14700KF",
    "Intel Core i7-11700B",
    "Intel Core i5-12600K",
    "Intel Core i3-10105T",
    "AMD Ryzen 5 PRO 5650G",
    "AMD Ryzen 5 8500G",
    "Intel N97",
    "Intel Pentium Gold G6405",
    "AMD Ryzen 7 4800U",
    "AMD Ryzen 5 PRO 5675U",
    "Intel Core i9-9900K",
    "AMD Ryzen 5 5500",
    "AMD Ryzen 9 7900X",
    "Intel Core i5-10400F",
    "AMD Ryzen 5 7600",
    "Intel Core i9-13900KF",
    "Intel Pentium N5030",
    "Apple M1 Ultra",
    "Intel Core i9-10900F",
    "AMD Ryzen 7 7700",
    "AMD Ryzen 5 2400G",
    "ARM Cortex-A53",
    "Intel Core i5-14400T",
    "Intel Core i7-12700KF",
    "Intel Core i5-12400T",
    "Intel Core i3-10105",
    "Intel Core i3-10100F",
    "AMD Ryzen Threadripper PRO 5965WX",
    "AMD Ryzen Threadripper PRO 5955WX",
    "Intel Core i5-9500",
    "Intel Core i9-10900",
    "Intel Xeon W-2225",
    "Intel Pentium Gold G7400",
    "RockChip RK3368",
    "Intel Core i5-10600KF",
    "AMD Ryzen 7 Pro 5750G",
    "Intel Core i9-11900K",
    "Intel Pentium Silver N6000",
    "Intel Core Ultra 9 285K",
    "AMD Ryzen Embedded R2314",
    "AMD Ryzen 7 4700U",
    "AMD Ryzen 3 4300GE",
    "AMD Ryzen Threadripper PRO 5995WX",
    "AMD Ryzen 3 PRO 3300U",
    "Intel Core i9-11900KF",
    "AMD Ryzen Threadripper PRO 5945WX",
    "AMD Ryzen Threadripper PRO 7985WX",
    "Intel Core i9-11900",
    "AMD Ryzen 5 8600G",
    "AMD Ryzen 7 9800X3D",
    "AMD Ryzen 9 PRO 5945",
    "AMD Ryzen 9 7950X",
    "AMD Ryzen 9 7900",
    "AMD Ryzen 3 5400U",
    "Intel Core i7-11390H",
    "Intel Core i3-7100U",
    "Intel Core i5-14600K",
    "Intel Xeon W w3-2435",
    "Intel Core i9-11900KB",
    "AMD Ryzen 9 7950X3D",
    "Intel Core i9-14900T",
    "Intel Core i7-1370PE",
    "Intel Core i7-7565U",
    "Intel Atom x7425E",
    "Intel Core i3-14100T",
    "Intel Core i9-13900T",
    "Intel Xeon w5-2545",
    "Intel Core i9-11900F",
    "AMD Ryzen Embedded R1505G",
    "AMD Ryzen 5 7600X3D",
    "AMD Ryzen 5 5560U",
    "AMD Ryzen 7 7700X",
    "Intel Core i7-11700F",
    "AMD Ryzen 7 5800X3D",
    "Intel N150",
    "Intel Core i5-9500T",
    "Intel Atom E3815",
    "Intel Core i9-12900K",
    "AMD Ryzen Threadripper PRO 5975WX",
    "Intel Core i5-6400",
    "Intel Core i5-8400T",
    "Intel Core i3-10100T",
    "Intel Core i5-3470",
    "Intel Core i5-10500T",
    "AMD Ryzen 3 PRO 8300G",
    "AMD Ryzen Embedded V2546",
    "Intel Core i3-8100",
    "Intel Pentium 4",
    "AMD Ryzen 5 Pro 5650GE",
    "AMD Ryzen 9 7900X3D",
    "AMD Ryzen Embedded V1756B",
    "AMD Ryzen 7 5800U",
    "AMD Ryzen 7 5700X3D",
    "Intel Core Ultra 7 265KF",
    "AMD Ryzen 5 3400GE",
    "Intel Core i7-7700",
    "Intel Xeon W-2245",
    "Intel Core i3-6100",
    "Intel Core i5-4570",
    "Intel Core i3-9100",
    "Intel Core i3-7100T",
    "Intel Core i7-10700K",
    "Intel Core i7-4770",
    "Intel Core i9-11900T",
    "Intel Core i3-1305U",
    "Intel Core i3-8100T",
    "AMD Ryzen 5 3400G",
    "Intel Core i9-10920X",
    "Intel Xeon W2123",
    "Intel Pentium Gold G6400",
    "Intel Core i5-6500",
    "Intel Celeron G1620",
    "AMD A10-8750",
    "Intel Pentium Silver J5005",
    "Intel Core i7-9700F",
    "Intel Core i7-5960X",
    "AMD Ryzen 9 9900X",
    "Intel Celeron 4205U",
    "Intel Core i5-6260U",
    "AMD Ryzen 5 3550H",
    "Intel Core i5-8365UE",
    "Intel Core i7-11700T",
    "Intel Core i3-9100T",
    "AMD Ryzen Threadripper PRO 3955WX",
    "AMD Ryzen 3 PRO 5350GE",
    "Intel Core i5-10600K",
    "Intel Core i9-10900K",
    "Intel Core i3-3110M",
    "Intel Core i7-8559U",
    "Intel Pentium 3558U",
    "Intel Core i5-13600",
    "Intel Core i5-13600K",
    "Intel Atom D525",
    "Intel Core i5-1030NG7",
    "Intel Celeron J4105",
    "Intel Core i5-5300U",
    "Intel Celeron G1840",
    "Intel Core i9-12900F",
    "Intel Core i5-8400",
    "Pentium N4200",
    "Intel Core i7-7700K",
    "AMD A10 PRO-8770",
    "Intel Core i5-4590",
    "Intel Core i3-6100U",
    "VIA Eden",
    "Intel Core i5-4670",
    "AMD GX-215JJ",
    "AMD Ryzen Embedded R1305G",
    "Intel Pentium N3700",
    "Intel Core i3-12100F",
    "Intel Xeon Silver 4210R",
    "AMD Ryzen 9 5950X"
]

const gpuOptions = [
  "Intel Iris Xe Graphics",
  "Intel Arc Graphics",
  "NVIDIA GeForce RTX 4070",
  "AMD Radeon Graphics",
  "Apple M3 Graphics",
  "NVIDIA GeForce RTX 3050",
  "Intel UHD Graphics",
  "Apple M4 Graphics",
  "AMD Radeon 610M",
  "NVIDIA GeForce RTX 4060",
  "NVIDIA GeForce RTX 4050",
  "Qualcomm Adreno X Plus",
  "AMD Radeon RX Vega",
  "NVIDIA RTX 4000 Ada",
  "Qualcomm Adreno",
  "Intel Graphics",
  "Apple M2 Graphics",
  "NVIDIA GeForce RTX 2050",
  "Apple M4 Pro Graphics",
  "Apple M4 Max Graphics",
  "Intel UHD Graphics 600",
  "AMD Radeon 860M",
  "NVIDIA GeForce RTX 4090",
  "NVIDIA GeForce GTX 1650",
  "AMD Radeon 890M",
  "AMD Radeon 660M",
  "AMD Radeon Vega 8 Graphics",
  "Qualcomm Adreno 680",
  "Qualcomm Adreno 540 GPU",
  "AMD Radeon RX 7600S",
  "NVIDIA GeForce RTX 4080",
  "ARM Mali-G72 MP3",
  "AMD Radeon 780M",
  "Intel HD Graphics",
  "NVIDIA RTX 2000 Ada",
  "AMD Radeon R4",
  "AMD Radeon 880M",
  "Intel Arc Graphics 140V",
  "NVIDIA GeForce RTX 3080",
  "Apple M3 Pro Graphics",
  "AMD Uma",
  "NVIDIA RTX A500",
  "AMD Radeon RX 6700S",
  "AMD Radeon RX Vega 7",
  "NVIDIA Quadro RTX 3000",
  "NVIDIA RTX A1000",
  "NVIDIA RTX 1000 Ada",
  "Intel UHD Graphics 620",
  "NVIDIA RTX 3500 Ada",
  "NVIDIA RTX 500 Ada",
  "NVIDIA RTX 2000",
  "NVIDIA GeForce RTX 3050 Ti",
  "Intel Xe Graphics",
  "AMD Radeon 680M",
  "NVIDIA RTX 3500",
  "Qualcomm Adreno X Elite",
  "NVIDIA Quadro RTX 5000",
  "AMD Radeon",
  "NVIDIA Quadro RTX 4000",
  "Intel Iris Plus Graphics 655",
  "NVIDIA RTX 3000 Ada",
  "NVIDIA GeForce RTX 3060",
  "NVIDIA GeForce MX330",
  "NVIDIA GeForce RTX 3070",
  "NVIDIA GeForce RTX 3070 Ti",
  "Intel Iris Graphics",
  "Qualcomm Adreno 690",
  "NVIDIA GeForce MX550",
  "NVIDIA RTX 5000 Ada",
  "NVIDIA RTX A2000",
  "NVIDIA GeForce RTX 2060",
  "AMD Radeon 760M",
  "NVIDIA RTX A4000",
  "NVIDIA GeForce RTX 2080 Super",
  "NVIDIA T600",
  "AMD Radeon RX Vega 8",
  "AMD Radeon R3",
  "Intel Arc A350M",
  "NVIDIA RTX A5000",
  "NVIDIA GeForce RTX 3080 Ti",
  "NVIDIA RTX A5500",
  "AMD Radeon RX 6500M",
  "NVIDIA T1200",
  "NVIDIA Quadro T1000",
  "Intel Iris Plus Graphics",
  "Intel Arc Graphics 130V",
  "Intel HD Graphics 500",
  "NVIDIA GeForce GTX 1660 Ti",
  "NVIDIA GeForce MX450",
  "NVIDIA RTX A3000",
  "Intel Arc Pro A30M",
  "Apple M2 Pro Graphics",
  "AMD Radeon RX Vega 3",
  "Intel Arc A730M",
  "NVIDIA GeForce MX570",
  "Intel Arc A370M",
  "AMD Radeon Vega 9",
  "NVIDIA GeForce MX250",
  "Qualcomm Adreno 618",
  "Intel HD Graphics 5500",
  "Intel Iris Graphics 6100",
  "NVIDIA GeForce GTX 1050",
  "NVIDIA GeForce GTX 950M",
  "NVIDIA GeForce MX350",
  "NVIDIA Quadro P520",
  "Intel HD Graphics 520",
  "NVIDIA Quadro T2000",
  "NVIDIA T550",
  "AMD Radeon 740M",
  "Intel HD Graphics 600",
  "AMD Radeon R4 Graphics",
  "Intel UHD Graphics 770",
  "Apple M4 10-Core GPU",
  "NVIDIA GeForce RTX 4060 Ti",
  "NVIDIA GeForce RTX 4070 Ti Super",
  "NVIDIA GeForce RTX 4070 Super",
  "Apple M4 Pro 16-Core GPU",
  "Intel HD Graphics 400",
  "AMD Radeon RX 7900 XTX",
  "NVIDIA GeForce GT 710",
  "AMD Radeon RX 7900 XT",
  "Intel UHD Graphics 730",
  "Apple M2 GPU",
  "AMD Radeon RX 7800 XT",
  "Intel UHD Graphics 630",
  "AMD Radeon RX 7700 XT",
  "AMD Radeon RX Vega 6",
  "AMD Radeon RX 6400",
  "Apple M2 Max GPU",
  "sin tarjeta gráfica",
  "Apple M2 Pro GPU",
  "AMD Radeon RX 6600",
  "2 x AMD FirePro D700",
  "AMD Radeon RX Vega 10",
  "Intel UHD Graphics 750",
  "NVIDIA T1000",
  "NVIDIA GeForce RTX 3060 Ti",
  "NVIDIA GeForce GTX 1660 Super",
  "NVIDIA Quadro T400",
  "Apple M2 Ultra GPU",
  "NVIDIA GeForce RTX 4080 Super",
  "Intel HD Graphics 4600",
  "AMD Radeon RX 6700 XT",
  "NVIDIA Quadro RTX 6000",
  "Intel HD Graphics 630",
  "Intel UHD Graphics 605",
  "Intel UHD Graphics 610",
  "AMD Radeon RX Vega 11",
  "NVIDIA GeForce RTX 4070 Ti",
  "NVIDIA GeForce GTX 1650 Super",
  "NVIDIA GeForce GT 730",
  "PowerVR SGX6110",
  "Intel HD Graphics 530",
  "NVIDIA T400",
  "NVIDIA Quadro RTX A5000",
  "NVIDIA RTX A6000",
  "Intel HD Graphics 620",
  "Intel Iris Graphics 650",
  "NVIDIA RTX 4500 Ada",
  "AMD Radeon RX 7900 GRE",
  "Intel Arc A770 Graphics",
  "AMD Radeon RX 6600M",
  "NVIDIA GeForce GTX 980",
  "NVIDIA GeForce GTX 970",
  "NVIDIA Quadro M2000",
  "NVIDIA GeForce GT 1030",
  "NVIDIA RTX A4500",
  "NVIDIA Quadro 600",
  "NVIDIA GeForce RTX 3090",
  "Intel UHD Graphics 1250",
  "NVIDIA GeForce GTX 1060",
  "NVIDIA Quadro P1000",
  "AMD Radeon RX 480",
  "AMD Radeon R7",
  "Intel HD Graphics 605",
  "NVIDIA GeForce RTX 2070 Super",
  "2 x nVidia GeForce GTX 980 Ti",
  "Intel HD Graphics 540",
  "NVIDIA Quadro P2200",
  "Intel HD Graphics 4000",
  "AMD Radeon RX 6500 XT",
  "NVIDIA RTX A400",
  "nVidia NextGen Ion",
  "Intel HD Graphics 4400",
  "AMD Radeon RX 550",
  "NVIDIA GeForce GTX 1080",
  "AMD Radeon RX 7600",
  "NVIDIA GeForce GTX 1630",
  "AMD Radeon RX 6750 XT",
  "VIA Chrome9",
  "AMD Radeon R2E",
  "nVidia Quadro M4000",
  "Matrox G200"
]
// Sample feature importance (simulated)
const featureImportance = [
  { feature: "CPU", importance: 0.28 },
  { feature: "GPU", importance: 0.22 },
  { feature: "RAM", importance: 0.18 },
  { feature: "Storage", importance: 0.12 },
  { feature: "Screen Size", importance: 0.10 },
  { feature: "OS", importance: 0.06 },
  { feature: "Clock Speed", importance: 0.04 }
].sort((a, b) => b.importance - a.importance);

const Prediction = () => {
  // State for form inputs
  const [deviceType, setDeviceType] = useState<string>("laptop");
  const [ram, setRam] = useState<number>(16);
  const [storage, setStorage] = useState<number>(512);
  const [cpu, setCpu] = useState<string>("Apple M3");
  const [clockSpeed, setClockSpeed] = useState<number>(2.8);
  const [cores, setCores] = useState<number>(4);
  const [ramType, setRamType] = useState<string>("DDR4");
  const [ramFrequency, setRamFrequency] = useState<number>(2000);
  const [gpu, setGpu] = useState<string>("Intel Iris Xe Graphics");
  const [screenSize, setScreenSize] = useState<number>(15.6);
  const [os, setOs] = useState<string>("Windows 11 Home");
  const [bluetoothVersion, setBluetoothVersion] = useState<string>("5.1");
  //only for desktops
  const [psuWattage, setPsuWattage] = useState<string>("27.0");
  //only for laptops
  const [batteryWattHours, setBatteryWattHours] = useState<number>(0);
  const [cameraResolution, setCameraResolution] = useState<string>("1920x1080");
  const [screenTechnology, setScreenTechnology] = useState<string>("Full HD");
  const [screenResolution, setScreenResolution] = useState<string>("1920 x 1080");

  // output
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [similarProducts, setSimilarProducts] = useState<any>(null);
  const [featureImportances, setFeatureImportances] = useState<any>(null);

  // State for all laptop data and dropdown options
  const [allLaptops, setAllLaptops] = useState<Laptop[]>([]);
  // const [cpuOptions, setCpuOptions] = useState<string[]>([]);
  // const [gpuOptions, setGpuOptions] = useState<string[]>([]);
  // const [osOptions, setOsOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const bluetoothOptions = ["5.1", "5.2", "5.3", "5.4"];

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const laptops = await getLaptopDataPromise();
        setAllLaptops(laptops);

        const cpus = await getCPUs();
        // setCpuOptions(cpus);
        if (cpus.length > 0) setCpu(cpus[0]);

        const gpus = await getGPUs();
        // setGpuOptions(gpus);
        if (gpus.length > 0) setGpu(gpus[0]);

        const oses = await getOSes();
        // setOsOptions(oses);
        if (oses.length > 0) setOs(oses[0]);

      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Correlation data for visualization
  const correlationData = useMemo(() => {
    return [
      { feature: "RAM", correlation: 0.68, price: 0 },
      { feature: "Storage", correlation: 0.52, price: 0 },
      { feature: "Screen Size", correlation: 0.41, price: 0 },
      { feature: "Clock Speed", correlation: 0.35, price: 0 }
    ].map(item => {
      // Add some variance to make scatter plot more interesting
      const priceVariance = Math.random() * 1000 + 500;
      return {
        ...item,
        price: item.correlation * 2500 + priceVariance
      };
    });
  }, []);

  // Scatter plot data showing price vs feature values
  const scatterData = useMemo(() => {
    if (isLoading || allLaptops.length === 0) return []; // Changed: Use allLaptops state and check loading
    
    return allLaptops.map(laptop => ({
      ram: laptop.ram,
      price: laptop.price,
      brand: laptop.brand
    }));
  }, [allLaptops, isLoading]); // Added isLoading and allLaptops to dependencies

  // Price prediction function (simplified simulation)
  // const predictPrice = () => {
  //   if (isLoading) return; // Don't predict if loading

  //   // Base price based on CPU
  //   let basePrice = 500;
  //   if (cpu.includes("i7") || cpu.includes("Ryzen 7") || cpu.includes("M2")) {
  //     basePrice = 800;
  //   } else if (cpu.includes("i5") || cpu.includes("Ryzen 5") || cpu.includes("M1")) {
  //     basePrice = 650;
  //   }
    
  //   // Adjust for RAM
  //   const ramPrice = ram * 15;
    
  //   // Adjust for storage
  //   const storagePrice = storage * 0.1;
    
  //   // Adjust for GPU
  //   let gpuPrice = 0;
  //   if (gpu.includes("RTX 30") || gpu.includes("RX 6")) {
  //     gpuPrice = 300;
  //   } else if (gpu.includes("Iris") || gpu.includes("M1") || gpu.includes("M2")) {
  //     gpuPrice = 150;
  //   }
    
  //   // Adjust for screen size
  //   const screenPrice = screenSize * 20;
    
  //   // Adjust for OS
  //   let osPrice = 0;
  //   if (os === "macOS") {
  //     osPrice = 200;
  //   } else if (os === "Windows 11") {
  //     osPrice = 100;
  //   }
    
  //   // Adjust for clock speed
  //   const clockPrice = clockSpeed * 50;
    
  //   // Calculate final price with some randomness
  //   const calculatedPrice = basePrice + ramPrice + storagePrice + gpuPrice + screenPrice + osPrice + clockPrice;
  //   const finalPrice = Math.round(calculatedPrice * (0.95 + Math.random() * 0.1));
    
  //   setPredictedPrice(finalPrice);
  // };

  if (isLoading) { // Added loading indicator
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-2xl text-muted-foreground">Loading prediction tools...</p>
      </div>
    );
  }

  const predictPrice = async () => {
    let data = {};

    if (deviceType === "desktop") {
      data = {
        "device_type": deviceType,
        "feature_values": {
          "procesador": cpu,
          "procesador_tipo": cpu,
          "procesador_frecuencia_turbo_max_ghz": clockSpeed,
          "procesador_numero_nucleos": cores,
          "grafica_tarjeta": gpu,
          "disco_duro_capacidad_de_memoria_ssd_gb": storage,
          "ram_memoria_gb": ram,
          "ram_tipo": ramType,
          "ram_frecuencia_de_la_memoria_mhz": ramFrequency,
          "sistema_operativo_sistema_operativo": os,
          "comunicaciones_version_bluetooth": bluetoothVersion,
          "alimentacion_wattage_binned": parseInt(psuWattage)
        }
      }
    }
    else if (deviceType === "laptop") {
      data = {
        "device_type": deviceType,
        "feature_values": {
          "procesador": cpu,
          "procesador_tipo": cpu,
          "procesador_frecuencia_turbo_max_ghz": clockSpeed,
          "procesador_numero_nucleos": cores,
          "grafica_tarjeta": gpu,
          "disco_duro_capacidad_de_memoria_ssd_gb": storage,
          "ram_memoria_gb": ram,
          "ram_tipo": ramType,
          "ram_frecuencia_de_la_memoria_mhz": ramFrequency,
          "sistema_operativo_sistema_operativo": os,
          "comunicaciones_version_bluetooth": bluetoothVersion,
          "alimentacion_vatios_hora": batteryWattHours,
          "camara_resolucion_pixeles": cameraResolution,
          "pantalla_tecnologia": screenTechnology,
          "pantalla_resolucion_pixeles": screenResolution,
        }
      }
    }

    try {
      const response = await getPricePrediction(data);
      console.log(response)
      setPredictedPrice(response.predicted_price);

      const importanceSum = Object.values(response.feature_importances).reduce((sum, importance) => Number(sum) + Number(importance), 0);
      // each feature is a key and the value is the importance
      // first map every pair to a feature importance object
      const formattedFeatureImportances = Object.entries(response.feature_importances).map(([feature, importance]) => ({
        feature,
        importance: Number(importance) / Number(importanceSum)
      }));
      const sortedFeatureImportances = formattedFeatureImportances.sort((a, b) => b.importance - a.importance);

      setFeatureImportances(sortedFeatureImportances);
    } catch (error) {            
      console.error("Failed to get price prediction:",{message: error.message,
      responseData: error.response?.data,
      status: error.response?.status,
      fullError: error});
    }


    try {
      const simProds = await getKSimilarProducts(data);
      console.log(simProds.similar_products)
      for (let prod in simProds.similar_products) {
        console.log(prod)
      }
      setSimilarProducts(simProds);
    } catch (error) {            
      console.error("Failed to get K Similar Products:",{message: error.message,
      responseData: error.response?.data,
      status: error.response?.status,
      fullError: error});
    }
  };

  // console.log(similarProducts.similar_products)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Price Prediction</h1>
        <p className="text-muted-foreground">
          Estimate computer prices based on specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Computer Specifications</CardTitle>
            <CardDescription>
              Enter the specifications to predict the price.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="space-y-2">
              <Label htmlFor="deviceType">Device Type</Label>
              <Select value={deviceType} onValueChange={setDeviceType} disabled={isLoading}>
                <SelectTrigger id="deviceType">
                  <SelectValue placeholder="Select Device Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="ram">RAM (GB)</Label>
                <span className="text-sm font-medium">{ram} GB</span>
              </div>
              <Slider
                id="ram"
                min={2}
                max={256}
                step={2}
                value={[ram]}
                onValueChange={(value) => setRam(value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="storage">Storage (GB)</Label>
                <span className="text-sm font-medium">{storage} GB</span>
              </div>
              <Slider
                id="storage"
                min={128}
                max={8192}
                step={128}
                value={[storage]}
                onValueChange={(value) => setStorage(value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpu">CPU</Label>
              <Select value={cpu} onValueChange={setCpu} disabled={isLoading || cpuOptions.length === 0}>
                <SelectTrigger id="cpu">
                  <SelectValue placeholder="Select CPU" />
                </SelectTrigger>
                <SelectContent>
                  {cpuOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="clockSpeed">Clock Speed (GHz)</Label>
                <span className="text-sm font-medium">{clockSpeed.toFixed(1)} GHz</span>
              </div>
              <Slider
                id="clockSpeed"
                min={1.0}
                max={6.0}
                step={0.1}
                value={[clockSpeed]}
                onValueChange={(value) => setClockSpeed(value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="cores">Cores</Label>
                <span className="text-sm font-medium">{cores}</span>
              </div>
              <Slider
                id="cores"
                min={1}
                max={16}
                step={1}
                value={[cores]}
                onValueChange={(value) => setCores(value[0])}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ramType">Ram Type</Label>
              <Select value={ramType} onValueChange={setRamType} disabled={isLoading}>
                <SelectTrigger id="ramType">
                  <SelectValue placeholder="Select Ram Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DDR2">DDR2</SelectItem>
                  <SelectItem value="DDR3">DDR3</SelectItem>
                  <SelectItem value="DDR4">DDR4</SelectItem>
                  <SelectItem value="DDR5">DDR5</SelectItem>
                  <SelectItem value="DDR3L">DDR3L</SelectItem>
                  <SelectItem value="DDR4L">DDR4L</SelectItem>
                  <SelectItem value="LPDDR4X">LPDDR4X</SelectItem>
                  <SelectItem value="LPDDR5X">LPDDR5X</SelectItem>
                  <SelectItem value="LPDDR3">LPDDR3</SelectItem>
                  <SelectItem value="LPDDR4">LPDDR4</SelectItem>
                  <SelectItem value="LPDDR5">LPDDR5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="ramFrequency">Ram Frequency (MHz)</Label>
                <span className="text-sm font-medium">{ramFrequency} MHz</span>
              </div>
              <Slider
                id="ramFrequency"
                min={500}
                max={10000}
                step={100}
                value={[ramFrequency]}
                onValueChange={(value) => setRamFrequency(value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpu">GPU</Label>
              <Select value={gpu} onValueChange={setGpu} disabled={isLoading || gpuOptions.length === 0}>
                <SelectTrigger id="gpu">
                  <SelectValue placeholder="Select GPU" />
                </SelectTrigger>
                <SelectContent>
                  {gpuOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="screenSize">Screen Size (inches)</Label>
                <span className="text-sm font-medium">{screenSize.toFixed(1)}"</span>
              </div>
              <Slider
                id="screenSize"
                min={13.3}
                max={17.3}
                step={0.1}
                value={[screenSize]}
                onValueChange={(value) => setScreenSize(value[0])}
                className="w-full"
              />
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="os">Operating System</Label>
              <Select value={os} onValueChange={setOs} disabled={isLoading || osOptions.length === 0}>
                <SelectTrigger id="os">
                  <SelectValue placeholder="Select OS" />
                </SelectTrigger>
                <SelectContent>
                  {osOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bluetoothVersion">Bluetooth Version</Label>
              <Select value={bluetoothVersion} onValueChange={setBluetoothVersion} disabled={isLoading}>
                <SelectTrigger id="bluetoothVersion">
                  <SelectValue placeholder="Select Bluetooth Version" />
                </SelectTrigger>
                <SelectContent>
                  {bluetoothOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {deviceType === "laptop" && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="batteryWattHours">Battery Watt Hours</Label>
                    <span className="text-sm font-medium">{batteryWattHours} Wh</span>
                  </div>
                  <Slider
                    id="batteryWattHours"
                    min={0}
                    max={1000}
                    step={10}
                    value={[batteryWattHours]}
                    onValueChange={(value) => setBatteryWattHours(value[0])}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cameraResolution">Camera Resolution</Label>
                  <Select value={cameraResolution} onValueChange={setCameraResolution} disabled={isLoading}>
                    <SelectTrigger id="cameraResolution">
                      <SelectValue placeholder="Select Camera Resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      {["2592x1944", "2560x1440", "1920x1080", "1280x720", "720x480", "640x480", "480x640"].map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screenTechnology">Screen Technology</Label>
                  <Select value={screenTechnology} onValueChange={setScreenTechnology} disabled={isLoading}>
                    <SelectTrigger id="screenTechnology">
                      <SelectValue placeholder="Select Screen Technology" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Retina",
                        "Full HD",
                        "UHD+",
                        "3K",
                        "WUXGA",
                        "WQXGA",
                        "WQXGA+",
                        "QHD",
                        "FHD+",
                        "2.8K",
                        "2.5K",
                        "WQUXGA",
                        "QHD+",
                        "HD Ready",
                        "Ultra HD",
                        "3,2K",
                        "HD+",
                        "4K",
                        "2K",
                        "2,2K",
                        "WQHD",
                        "WUXGA+",
                        "WXGA+"].map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screenResolution">Screen Resolution</Label>
                  <Select value={screenResolution} onValueChange={setScreenResolution} disabled={isLoading}>
                    <SelectTrigger id="screenResolution">
                      <SelectValue placeholder="Select Screen Resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      {["1920 x 1080", "2560 x 1440", "3840 x 2160"].map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {deviceType === "desktop" && (
              <div className="space-y-2">
                <Label htmlFor="psuWattage">PSU Wattage</Label>
                <Select value={psuWattage} onValueChange={setPsuWattage} disabled={isLoading}>
                  <SelectTrigger id="psuWattage">
                    <SelectValue placeholder="Select PSU Wattage" />
                  </SelectTrigger>
                  <SelectContent>
                    {["27.0", "31.0", "33.0", "35.0", "36.0", "37.0", "38.0", "39.0", "40.0", "41.0", "42.0", "42.3", "42.75", "43.0", "44.5", "45.0", "45.8", "46.0", "47.0", "47.4", "48.0", "48.5", "48.8", "48.96", "49.0", "49.5", "50.0", "51.0", "51.3", "51.5", "52.0", "52.4", "52.5", "52.6", "53.0", "53.3", "53.5", "53.8", "54.0", "54.7", "55.0", "56.0", "57.0", "58.0", "58.2", "58.7", "59.0", "60.0", "61.0", "62.0", "62.32", "63.0", "63.5", "64.0", "65.0", "66.0", "66.5", "67.0", "68.0", "70.0", "70.5", "71.0", "72.0", "73.0", "73.4", "73.6", "74.0", "75.0", "76.0", "77.0", "78.0", "80.0", "82.0", "83.0", "84.0", "86.0", "87.0", "88.0", "90.0", "92.0", "94.0", "94.24", "95.0", "96.0", "97.0", "99.0", "99.5", "99.8", "99.9", "100.0"].map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {predictedPrice !== null && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 text-center">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                  Estimated Price
                </h3>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                  ${predictedPrice.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Based on current market trends
                </p>
              </div>
            )}

            {similarProducts !== null && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 text-center">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                  Similar Products
                </h3>
                {similarProducts.similar_products.map((prod, index) => (
                  <div key={index} className="mt-2 text-left">
                    <h4 className="text-md font-semibold text-black dark:text-blue-200">
                      {prod.titulo}
                    </h4>
                    <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      <p>{"alimentacion_vatios_hora: " + prod.alimentacion_vatios_hora}</p>
                      <p>{"camara_resolucion_pixeles: " + prod.camara_resolucion_pixeles}</p>
                      <p>{"disco_duro_capacidad_de_memoria_ssd_gb: " + prod.disco_duro_capacidad_de_memoria_ssd_gb}</p>
                      <p>{"grafica_tarjeta: " + prod.grafica_tarjeta}</p>
                      <p>{"pantalla_resolucion_pixeles: " + prod.pantalla_resolucion_pixeles}</p>
                      <p>{"pantalla_tecnologia: " + prod.pantalla_tecnologia}</p>
                      <p>{"procesador: " + prod.procesador}</p>
                      <p>{"procesador_frecuencia_turbo_max_ghz: " + prod.procesador_frecuencia_turbo_max_ghz}</p>
                      <p>{"procesador_numero_nucleos: " + prod.procesador_numero_nucleos}</p>
                      <p>{"ram_frecuencia_de_la_memoria_mhz: " + prod.ram_frecuencia_de_la_memoria_mhz}</p>
                      <p>{"ram_memoria_gb: " + prod.ram_memoria_gb}</p>
                      <p>{"ram_tipo: " + prod.ram_tipo}</p>
                      <p>{"similarity_distance: " + prod.similarity_distance}</p>
                      <p>{"sistema_operativo: " + prod.sistema_operativo_sistema_operativo}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <CardFooter>
              <Button onClick={predictPrice} className="w-full" disabled={isLoading}>Predict Price</Button>
            </CardFooter>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Feature Importance</CardTitle>
              <CardDescription>
                Impact of each specification on the laptop price.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={featureImportances}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 'dataMax + 0.05']} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <YAxis type="category" dataKey="feature" width={120} interval={0} />
                    <Tooltip formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, 'Importance']} />
                    <Bar dataKey="importance" fill="#4f46e5">
                      {featureImportances?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#7c3aed'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Price vs. RAM</CardTitle>
              <CardDescription>
                Correlation between RAM and copmuter prices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="ram" 
                      name="RAM" 
                      unit="GB"
                      domain={['dataMin - 2', 'dataMax + 2']}
                      label={{ value: 'RAM (GB)', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="price" 
                      name="Price" 
                      unit="$"
                      label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
                    />
                    <ZAxis range={[60, 60]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => [name === 'RAM' ? `${value} GB` : `$${value}`, name]} />
                    <Legend />
                    <Scatter name="Laptops" data={scatterData} fill="#2563eb" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Prediction;
