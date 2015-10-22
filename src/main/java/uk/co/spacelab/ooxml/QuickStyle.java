package uk.co.spacelab.ooxml;

import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public enum QuickStyle {
	prc() {
		public void construct(XSSFWorkbook wb) {
			create(wb).format("0%");
		}
	},
	smallPRC() {
		public void construct(XSSFWorkbook wb) {
			create(wb).createFont().fontHeight(8).format("0%");
		}
	},
	prcNoDecimal() {
		public void construct(XSSFWorkbook wb) {
			create(wb).format("0%");
		}
	},
	yellowPRC() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(255, 235, 156).format("0%");
		}
	},
	wrappedText() {
		public void construct(XSSFWorkbook wb) {
			create(wb).wrapText(true);
		}
	},
	verticalString() {
		public void construct(XSSFWorkbook wb) {
			create(wb).rotation(90);
		}
	},
	boldText() {
		public void construct(XSSFWorkbook wb) {
			create(wb).createFont().fontWeight(Font.BOLDWEIGHT_BOLD);
		}
	},
	prcGrayOdd() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(191, 191, 191).format("0%");
		}
	},
	prcGrayEven() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(217, 217, 217).format("0%");
		}
	},
	prcPaleGreen() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(199, 238, 207).format("0%");
		}
	},
	prcPaleBlue() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(193, 204, 214).format("0%");
		}
	},
	style() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(251, 185, 194);
		}
	},
	paleYellowFloat() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(255, 235, 156).format("0.0");
		}
	},
	paleYellowPRC() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(255, 235, 156).format("0%");
		}
	},
	paleYellow() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(255, 235, 156);
		}
	},
	yellow() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(254, 234, 160);
		}
	},
	paleGreen() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(199, 238, 207);
		}
	},
	green() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(0, 255, 0);
		}
	},
	red() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(255, 0, 0);
		}
	},
	grayEven() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(217, 217, 217).format("0.0");
		}
	},
	grayOdd() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(191, 191, 191).format("0.0");
		}
	},
	grayOddPRC() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(191, 191, 191).format("0%");
		}
	},
	grayEvenNoDecimal() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(217, 217, 217).format("0");
		}
	},
	grayOddNoDecimal() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(191, 191, 191).format("0");
		}
	},
	grayOddOneDecimal() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(191, 191, 191).format("0.0");
		}
	},
	evenMax() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(217, 217, 217).createFont().setBold()
					.fontColour(255, 0, 0);
		}
	},
	evenMin() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(217, 217, 217).createFont().setBold()
					.fontColour(0, 0, 255);
		}
	},
	oddMax() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(191, 191, 191).createFont().setBold()
					.fontColour(255, 0, 0);
		}
	},
	oddMin() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(191, 191, 191).createFont().setBold()
					.fontColour(0, 0, 255);
		}
	},
	paleRed() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(253, 174, 170);
		}
	},
	paleRedPRC() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(253, 174, 170).format("0%");;
		}
	},
	palerRed() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(254, 215, 213);
		}
	},
	paleBlue() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(149, 179, 215);
		}
	},
	paleBluePRC() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(149, 179, 215).format("0%");;
		}
	},
	palerBlue() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(175, 188, 206);
		}
	},
	palePink() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(230, 184, 183);
		}
	},
	lightBlue() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(193, 204, 214);
		}
	},
	lightOrange() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(228, 204, 178);
		}
	},
	palerOrange() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(244, 234, 221);
		}
	},
	g242() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(242, 242, 242).format("0.0");
		}
	},
	g242PRC() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(242, 242, 242).format("0%");
		}
	},
	g242NoDecimal() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(242, 242, 242).format("0");
		}
	},
	oneDecimal() {
		public void construct(XSSFWorkbook wb) {
			create(wb).format("0.0");
		}
	},
	noDecimal() {
		public void construct(XSSFWorkbook wb) {
			create(wb).format("0");
		}
	},
	tableHeader() {
		public void construct(XSSFWorkbook wb) {
			create(wb).fill(242, 144, 42).wrapText(true).centerText()
					.createFont().fontName("Apercu").setBold()
					.fontColour(254, 254, 254);
		}
	},
	plain() {
		public void construct(XSSFWorkbook wb) {
			create(wb);
		}
	};
	XSSFCellStyle s;
	XSSFWorkbook wb;
	// enum CellProperty {
	// NODECIMAL, BOLD;
	// }
	// @SuppressWarnings("serial")
	// private static Map<CellProperty, Map<QuickStyle, QuickStyle>>
	// cellProperties =
	// new HashMap<CellProperty, Map<QuickStyle, QuickStyle>>() {
	// {
	// for (CellProperty prop : CellProperty.values())
	// put(prop, new HashMap<QuickStyle, QuickStyle>());
	// }
	// };
	// private static Map<String, QuickStyle> colouredCells =
	// new HashMap<String, QuickStyle>();
	// static public QuickStyle getColourStyle(XSSFWorkbook wb, String
	// fillColour) {
	// if (colouredCells.containsKey(fillColour))
	// return colouredCells.get(fillColour);
	// QuickStyle nqs = cloneFrom(plain).create(wb).fill(fillColour);
	// colouredCells.put(fillColour, nqs);
	// return nqs;
	// }
	// public QuickStyle noDecimal(QuickStyle qs) {
	// return getExistingWithPropertyOrClone(qs, CellProperty.NODECIMAL)
	// .format("0");
	// }
	// public QuickStyle bold(QuickStyle qs) {
	// return getExistingWithPropertyOrClone(qs, CellProperty.BOLD)
	// .format("0");
	// }
	// private QuickStyle getExistingWithPropertyOrClone(QuickStyle qs,
	// CellProperty prop) {
	// if (cellProperties.get(prop).containsKey(qs))
	// return cellProperties.get(prop).get(qs);
	// QuickStyle nqs = cloneFrom(qs);
	// cellProperties.get(prop).put(qs, nqs);
	// return nqs;
	// }
	private QuickStyle() {
	}
	public abstract void construct(XSSFWorkbook wb);
	static Font baseFont;
	QuickStyle cloneFrom(QuickStyle qs) {
		create(qs.wb);
		s.cloneStyleFrom(qs.s);
		return this;
	}
	QuickStyle create(XSSFWorkbook wb) {
		s = wb.createCellStyle();
		if (baseFont == null) {
			baseFont = wb.createFont();
			baseFont.setFontName("Apercu");
			baseFont.setBoldweight(Font.BOLDWEIGHT_NORMAL);
		}
		s.setFont(baseFont);
		this.wb = wb;
		return this;
	}
	QuickStyle format(String format) {
		s.setDataFormat(wb.createDataFormat().getFormat(format));
		return this;
	}
	QuickStyle fill(int r, int g, int b) {
		s.setFillForegroundColor(new XSSFColor(new java.awt.Color(r, g, b)));
		s.setFillPattern((short) 1);
		return this;
	}
	QuickStyle fill(String hexrgb) {
		s.setFillForegroundColor(new XSSFColor(new java.awt.Color(ExcelHelper
				.getByteFromHexString(hexrgb, 0), ExcelHelper
				.getByteFromHexString(hexrgb, 1), ExcelHelper
				.getByteFromHexString(hexrgb, 2))));
		s.setFillPattern((short) 1);
		return this;
	}
	QuickStyle fontColour(int r, int g, int b) {
		s.getFont().setColor(new XSSFColor(new java.awt.Color(r, g, b)));
		return this;
	}
	QuickStyle rotation(int rotation) {
		s.setRotation((short) rotation);
		return this;
	}
	QuickStyle wrapText(boolean wrap) {
		s.setWrapText(wrap);
		return this;
	}
	QuickStyle setBold() {
		fontWeight(Font.BOLDWEIGHT_BOLD);
		return this;
	}
	QuickStyle fontWeight(short boldWeight) {
		s.getFont().setBoldweight(boldWeight);
		return this;
	}
	QuickStyle createFont() {
		s.setFont(wb.createFont());
		return this;
	}
	QuickStyle fontHeight(double height) {
		s.getFont().setFontHeight(height);;
		return this;
	}
	QuickStyle fontName(String name) {
		s.getFont().setFontName(name);
		return this;
	}
	QuickStyle centerText() {
		s.setVerticalAlignment(VerticalAlignment.CENTER);
		s.setAlignment(HorizontalAlignment.CENTER);
		return this;
	}
	public XSSFCellStyle get() {
		return s;
	}
}
